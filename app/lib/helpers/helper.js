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
                    
                    if (postProcessedFile.type === 'photo') {
                        activityItem = {
                            name: postProcessedFile.name,
                            url: _fbResult.publicUrl,
                            file: postProcessedFile.url,
                            size: fileSize + ' ' + fileSizeUnit,
                            type: postProcessedFile.type,
                            date: moment().format("MMM D, LTS"),
                            videothumbnail: '/images/videofile.png',
                            status: 'success'
                        };
                    } else {
                        activityItem = {
                            name: postProcessedFile.name,
                            url:  _fbResult.publicUrl,
                            file: postProcessedFile.url,
                            size: fileSize + ' ' + fileSizeUnit,
                            type: postProcessedFile.type,
                            date: moment().format("MMM D, LTS"),
                            videothumbnail: '/images/videofile.png',
                            status: 'success' 
                        };                
                    }
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
                        videothumbnail: '/images/videofile.png',
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
            var outputFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
            if (!outputFile.write(_e.media)) {
                // handle write error
                console.error('Error: could not write video data to a file '+filename);

            }
            
            Ti.Media.exportVideo({
                url: outputFile.nativePath,
                quality: "medium"
            });
            Ti.Media.addEventListener('exportvideo:completed', function videoCompleted(_compressedFile) {
                Ti.Media.removeEventListener('exportvideo:completed', videoCompleted);
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
            
            outputFile = null;

            
        } else if(_e.mediaType === 'public.image') {
       
            let ratio = _e.media.width > _e.media.height ? _e.media.width/ _e.media.height: _e.media.height/ _e.media.width;
            let newW = Alloy.Globals.photoDesiredSize;
            let newH = newW * ratio;
            let resizedImage = _e.media.imageAsResized(newW, newH);

            var filename = 'photo_' + moment().format('YYYYMMDDhhmmssSSS') + '.png';
            var outputFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
            if (!outputFile.write(resizedImage)) {
                // handle write error
                console.error('Error: could not write photo data to a file');
                                
            }               
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

    return {
        checkCameraPermission,
        uploadFile,
        processMedia
    };
})();

module.exports = helper;