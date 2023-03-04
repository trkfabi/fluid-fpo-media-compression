const moment = require('alloy/moment');
const logProgram = 'lib/helpers/helper';

var helper = (function () {

    function checkCameraPermission() {
        if (OS_IOS) {
            if (Ti.Media.hasCameraPermissions() && Ti.Media.hasAudioRecorderPermissions()) {
                return true;
            } else {
                Ti.Media.requestCameraPermissions(function (event) {
                    if (!event.success) {
                        return false;
                    }
                    Ti.Media.requestAudioRecorderPermissions(function (event2) {
                        if (!event2.success) {
                            return false;
                        }
                        return true;
                    });
                });
            }
        } else {
            if (!Ti.Media.hasCameraPermissions()) {
                Ti.Media.requestCameraPermissions(function (e) {
                    if (e.success) {
                        return checkStoragePermissions();
                    } else {
                        alert('No camera access allowed');
                        return false;
                    }
                });

            } else {
                return checkStoragePermissions();
            }

        }
    }

    function checkStoragePermissions() {

        if (!Ti.Android.hasPermission("android.permission.WRITE_EXTERNAL_STORAGE")) {            
            Ti.Android.requestPermissions("android.permission.WRITE_EXTERNAL_STORAGE", function (e) {
                if (e.success) {
                    return true;
                } else {
                    return false;
                }
            });
        } else {
            return true;
        }
    }

    const uploadFile = _parms => {
        Alloy.Globals.doLog({
            text: 'uploadFile() URL: ' + JSON.stringify(_parms),
            program: logProgram
        });       
        let postProcessedFile = _parms.file;

        let uploadFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, postProcessedFile.name);
        let fileSize = null;
        let fileSizeUnit = '';
        if (!uploadFile.exists()) {     
            return false;
        }
        uploadFile = uploadFile.read();

        fileSize = uploadFile.size/1024;
        fileSize = fileSize.toFixed(2);
        fileSizeUnit = 'kb';
        if (Math.trunc(fileSize/1024) > 0) {
            fileSize = fileSize/1024;
            fileSize = fileSize.toFixed(2);
            fileSizeUnit = 'mb';
        }
        let activityItem;
        firebaseStorageHelper.upload({
            data: uploadFile,
            name: postProcessedFile.name,
            callback: _fbResult => {
                
                if (_fbResult.success) {
                    Alloy.Globals.doLog({
                        text: 'Upload success: ' + JSON.stringify(_fbResult),
                        program: logProgram
                    });
    
                    activityItem = {
                        name: postProcessedFile.name,
                        url: _fbResult.publicUrl,
                        file: postProcessedFile.url,
                        size: fileSize + ' ' + fileSizeUnit,
                        type: postProcessedFile.type,
                        date: moment().format("MMM D, LTS"),
                        thumbnail: postProcessedFile.type === 'photo'? '/images/photofile.png':  '/images/videofile.png',
                        status: 'success'
                    };
                
                    _parms.onSuccess && _parms.onSuccess({
                        item: activityItem
                    });
                                  
                } else {
                    Alloy.Globals.doLog({
                        text: 'Upload error: ' + JSON.stringify(_fbResult),
                        program: logProgram
                    });
        
                    activityItem = {
                        name: postProcessedFile.name,
                        url: '',
                        file: postProcessedFile.url,
                        size: fileSize + ' ' + fileSizeUnit,
                        type: postProcessedFile.type,
                        date: moment().format("MMM D, LTS"),
                        thumbnail: postProcessedFile.type === 'photo'? '/images/photofile.png':  '/images/videofile.png',
                        status: 'error' 
                    }; 
                    _parms.onError && _parms.onError({
                        item: activityItem,
                        error: _fbResult
                    }); 
                }
            }
        });
    };    


    const processMedia = (_e, _callback) => {
        Alloy.Globals.doLog({
            text: 'processMedia(): '+ JSON.stringify(_e),
            program: logProgram
        });     
        
        if(_e.mediaType === 'public.movie') {   
            Alloy.Globals.doLog({
                text: 'Item is a movie',
                program: logProgram
            });          

            var filename = 'movie_' + moment().format('YYYYMMDDhhmmssSSS') + '.mov';
            var outputFile  = OS_IOS ? 
                Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, filename):
                Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
            if (!outputFile.write(_e.media)) {
                // handle write error
                console.error('Error: could not write video data to a file '+filename);

            }
            
            if(OS_IOS) {
                Ti.Media.exportVideo({
                    url: outputFile.nativePath,     
                    bitRate: Alloy.Globals.videoBitRate,  // 20 ~ 512kb (10 secs) ,  1250000 ~ 1.7mb (10 secs)
                    watermark: moment().format("YYYY-MM-DD HH:mm:ss"),
                    fps: Alloy.Globals.videoFPS,
                    width: 0, // 0 to use original width
                    height: 0 // 0 to use original height
                });
                Ti.Media.addEventListener('exportvideo:completed', function videoCompleted(_compressedFile) {
                    Ti.Media.removeEventListener('exportvideo:completed', videoCompleted);

                    outputFile.deleteFile();
                    outputFile = null;
                    _callback && _callback({
                        success: true,
                        message: '',
                        data: {
                            name: filename,
                            url: _compressedFile.url,
                            type: 'video'
                        }
                    });                
                });
            } else {
                var targetName = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "compressed_video.mp4").nativePath.slice(7);  //remove "file://"

                const AndroidVideoCompression = require('com.inzori.androidvideocompression');
                AndroidVideoCompression.compressVideo({
                    url: outputFile.nativePath, 
                    targetPath: targetName,
                    quality: 'VERY_HIGH',
                    //bitRate: Alloy.Globals.videoBitRate,  // 20 ~ 512kb (10 secs) ,  1250000 ~ 1.7mb (10 secs)
                    watermark: moment().format("YYYY-MM-DD HH:mm:ss")       
                });
                AndroidVideoCompression.addEventListener('android_compression_result', function videoCompleted(_result) {
                    AndroidVideoCompression.removeEventListener('android_compression_result', videoCompleted);

                    outputFile.deleteFile();
                    outputFile = null;
                    // sent: file:///data/user/0/com.fluidmarket.mediacompression/app_appdata/movie_20230118015719168.mov
                    // received: /data/user/0/com.fluidmarket.mediacompression/files/compressed_video.mp4
                    _callback && _callback({
                        success: _result.success,
                        message: _result.error || '',
                        data: {
                            name: filename,
                            url: 'file://' + _result.path,
                            type: 'video'
                        }
                    });                     
                });
            }

        } else if(_e.mediaType === 'public.image') {
            Alloy.Globals.doLog({
                text: 'Item is a photo',
                program: logProgram
            });    

            Alloy.Globals.doLog({
                text: 'Create watermark',
                program: logProgram
            });    
            
            let auxView = Ti.UI.createView({
                height:_e.media.height,
                width: _e.media.width
            });
            let auxImageView = Ti.UI.createImageView({
                height: _e.media.height, 
                width: _e.media.width, 
                image: _e.media
            });
            let auxTimestamp = Ti.UI.createLabel({
                text: moment().format("YYYY-MM-DD HH:mm:ss"),
                height: Ti.UI.SIZE,
                width: Ti.UI.SIZE,
                backgroundColor: '#000000',
                textAlign: 'left',
                color: '#FFFFFF',
                font: {
                    fontSize: 50
                },
                top: 0,
                left: 0, 
                zIndex: 10               
            });
            auxView.add(auxImageView);
            auxView.add(auxTimestamp);   
            var _blob = auxView.toImage(null, false) ;            
            //console.warn('resizedWatermarked: w: '+_blob.width+' h: '+_blob.height + ' size: '+_blob.size);

            let ratio = _blob.width < _blob.height ? _blob.width/ _blob.height: _blob.height/ _blob.width;
            let newH = Alloy.Globals.photoDesiredSize;
            let newW = newH * ratio;
            let resizedImage = _blob.imageAsResized(newW, newH);
            resizedImage = resizedImage.imageAsCompressed(Alloy.Globals.photoCompressionRatio);


            const extension = resizedImage.mimeType === 'images/png' ? '.png' : '.jpg';
            var filename = `photo_${moment().format('YYYYMMDDhhmmssSSS')}${extension}`;
            
            var outputFile  = OS_IOS ? 
            Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, filename):
            Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);                
            
            if (!outputFile.write(resizedImage)) {
                // handle write error
                console.error('Error: could not write photo data to a file');
                                
            }      
            _blob = null;   
                
            _callback && _callback({
                success: true,
                message: '',
                data: {
                    name: filename,
                    url: outputFile.nativePath,
                    type: 'photo'
                }
            }); 
        }    
    };

    const listDirectories = () => {
        Alloy.Globals.doLog({
            text: 'listDirectories()',
            program: logProgram
        }); 
        // let tempDirectory = OS_IOS ? Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory): Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory);
        // if (tempDirectory.isDirectory()) {
        //     let filesInDirectory = tempDirectory.getDirectoryListing();
        //     Alloy.Globals.doLog({
        //         text: 'tempDirectory: '+JSON.stringify(filesInDirectory),
        //         program: logProgram
        //     }); 
        // }
        //if ( OS_IOS) {
            let appDirectory = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory);
            if (appDirectory.isDirectory()) {
                let filesInDirectory = appDirectory.getDirectoryListing();
                Alloy.Globals.doLog({
                    text: 'appDirectory: '+JSON.stringify(filesInDirectory),
                    program: logProgram
                }); 
            }   
        //} 
    };
    const emptyDirectories = () => {
        Alloy.Globals.doLog({
            text: 'emptyDirectories()',
            program: logProgram
        }); 
        // let tempDirectory = OS_IOS ? Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory): Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory);
        // if (tempDirectory.isDirectory()) {
        //     let filesInDirectory = tempDirectory.getDirectoryListing();
        //     filesInDirectory.forEach(tmpFileName => {
        //         let tmpFile = OS_IOS ? Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, tmpFileName): Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, tmpFileName);
        //         if (tmpFile.exists() && tmpFile.isFile()){
        //             Alloy.Globals.doLog({
        //                 text: 'tempDirectory: '+tmpFileName+ ' removed.',
        //                 program: logProgram
        //             }); 
        //             tmpFile.deleteFile();
        //         }
        //     });
        // }
        let appDirectory = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory);
        if (appDirectory.isDirectory()) {
            let filesInDirectory = appDirectory.getDirectoryListing();
            filesInDirectory.forEach(tmpFileName => {
                let tmpFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, tmpFileName);
                if (tmpFile.exists() && tmpFile.isFile()){
                    Alloy.Globals.doLog({
                        text: 'appDirectory: '+tmpFileName+ ' removed.',
                        program: logProgram
                    }); 
                    tmpFile.deleteFile();
                }
            });
        }        
    };
    return {
        checkCameraPermission,
        uploadFile,
        processMedia,
        listDirectories,
        emptyDirectories
    };
})();

module.exports = helper;