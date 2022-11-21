const moment = require('alloy/moment');
//const api = require('api').api;
const firebaseStorageHelper = require('/helpers/firebaseStorageHelper');
const alertDialogHelper = require("helpers/alertDialogHelper");
const logProgram = 'home/postProcess';
const args = $.args;

let activity = Alloy.Globals.activityHistory;

let postProcessedFiles = [];
let postProcessedFile = {};
let desiredSize = 640;
let actualItem, foundImages, foundVideos, uploadedItems;
let copiedUrls = 0, countSuccess = 0, sessionActivity = [];

let state = 'ready'; // uploading , done 

const blinking = Ti.UI.createAnimation({
    opacity: 0.3,
    duration : 500,
    autoreverse : true,
    repeat : 2
});

const activityIndicator = Ti.UI.createActivityIndicator({
    color: '#FFFFFF',
    style: Ti.UI.ActivityIndicatorStyle.PLAIN,
    left: 40,
    height: Ti.UI.SIZE,
    width: Ti.UI.SIZE
});

const doUploadFile = () => {
    Alloy.Globals.doLog({
        text: 'doUploadFile() actualItem: ' +actualItem,
        program: logProgram
    });       
    let activityItem;
    let postProcessedFile = postProcessedFiles[actualItem];

	let uploadFile = postProcessedFile.type === 'photo' ? postProcessedFile.blob: Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, postProcessedFile.name).read();
    let fileSize = null;
    let fileSizeUnit = '';

    $.retakeButton.enabled = false;
    $.uploadButton.enabled = false;
    $.uploadButton.title = 'Uploading...';
    $.uploadButton.add(activityIndicator);
    activityIndicator.show();
    state = 'uploading';

    fileSize = uploadFile.size/1024;
    fileSize = fileSize.toFixed(2);
    fileSizeUnit = 'kb';
    if (Math.trunc(fileSize/1024) > 0) {
        fileSize = fileSize/1024;
        fileSize = fileSize.toFixed(2);
        fileSizeUnit = 'mb';
    }
    
    firebaseStorageHelper.upload({
        data: uploadFile,
        name: postProcessedFile.name,
        callback: _fbResult => {
            
            if (_fbResult.success) {
                Alloy.Globals.doLog({
                    text: 'Upload success: ' + JSON.stringify(_fbResult),
                    program: logProgram
                });
                state = 'done';
                uploadedItems++;
    
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
    
                sessionActivity.push(activityItem);
    
                activity.push(activityItem);
                Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
                Alloy.Globals.activityHistory = activity;
    
                actualItem++;
                if (actualItem < postProcessedFiles.length) {
                    return doUploadFile();
                }
    
                doEndUploading();                
            } else {
                Alloy.Globals.doLog({
                    text: 'Upload error: ' + JSON.stringify(_fbResult),
                    program: logProgram
                });
    
                if (postProcessedFiles.length === 1) {
                    state = 'error';
                    Ti.UI.Clipboard.clearText();
    
                    $.messagesLabel.color = $.messagesLabel.errorColor;
                    $.messagesLabel.text = 'Error!\nCould not upload file.'
                    
                    $.retakeButton.enabled = true;
                    
                    activityIndicator.hide();
                    $.uploadButton.remove(activityIndicator);
                    $.uploadButton.enabled = true;
                    $.uploadButton.title = 'Retry'; 
                } else {
                    state = 'done';
                }
    
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
    
                activity.push(activityItem);
                Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
                Alloy.Globals.activityHistory = activity;    
                
                actualItem++;
                if (actualItem < postProcessedFiles.length) {
                    return doUploadFile();
                }
    
                doEndUploading();  
            }
        }
    });
    /*
    api.media.upload({
        media: uploadFile,
        onSuccess: _e => {
            Alloy.Globals.doLog({
                text: 'Upload success: ' + JSON.stringify(_e),
                program: logProgram
            });
            state = 'done';
            uploadedItems++;

            if (postProcessedFile.type === 'photo') {
                activityItem = {
                    name: postProcessedFile.name,
                    url: _e.data && _e.data.data && _e.data.data.attributes && _e.data.data.attributes['large-sq'],
                    file: postProcessedFile.url,
                    size: fileSize + ' ' + fileSizeUnit,
                    type: postProcessedFile.type,
                    date: moment().format("MMM D, LTS"),
                    videothumbnail: '/images/videofile.png',
                    status: 'success'
                };
            } else {
                // videos ??
                activityItem = {
                    name: postProcessedFile.name,
                    url:  '', //_e.data && _e.data.data && _e.data.data.attributes && _e.data.data.attributes['large-sq'],
                    file: postProcessedFile.url,
                    size: fileSize + ' ' + fileSizeUnit,
                    type: postProcessedFile.type,
                    date: moment().format("MMM D, LTS"),
                    videothumbnail: '/images/videofile.png',
                    status: 'error' 
                };                
            }

            sessionActivity.push(activityItem);

            activity.push(activityItem);
            Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
            Alloy.Globals.activityHistory = activity;

            actualItem++;
            if (actualItem < postProcessedFiles.length) {
                return doUploadFile();
            }

            doEndUploading();
        },
        onError: _e => {
            Alloy.Globals.doLog({
                text: 'Upload error: ' + JSON.stringify(_e),
                program: logProgram
            });

            if (postProcessedFiles.length === 1) {
                state = 'error';
                Ti.UI.Clipboard.clearText();

                $.messagesLabel.color = $.messagesLabel.errorColor;
                $.messagesLabel.text = 'Error!\nCould not upload file.'
                
                $.retakeButton.enabled = true;
                
                activityIndicator.hide();
                $.uploadButton.remove(activityIndicator);
                $.uploadButton.enabled = true;
                $.uploadButton.title = 'Retry'; 
            } else {
                state = 'done';
            }

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

            activity.push(activityItem);
            Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
            Alloy.Globals.activityHistory = activity;    
            
            actualItem++;
            if (actualItem < postProcessedFiles.length) {
                return doUploadFile();
            }

            doEndUploading();            
        }
    });
    */
};

function doEndUploading() {
    Alloy.Globals.doLog({
        text: 'doEndUploading()',
        program: logProgram
    });     
    copyToClipboard({
        callback: (_result) => {
            $.messagesTitleLabel.color = _result.messageTitleColor || $.messagesTitleLabel.successColor;
            $.messagesTitleLabel.text = _result.messageTitle;

            $.messagesLabel.color = _result.messageColor || $.messagesLabel.successColor;
            $.messagesLabel.text = _result.message;
            $.messagesLabel.animate(blinking);
            
            $.retakeButton.enabled = true;
            $.retakeButton.title = 'Re-copy';
        
            activityIndicator.hide();
            $.uploadButton.remove(activityIndicator);
            $.uploadButton.enabled = true;
            $.uploadButton.title = 'Take another'; 
        }
    });
}
function onResume() {
    console.warn('onResume');
    Ti.App.removeEventListener('resume', onResume);
    doEndUploading();
}
function copyToClipboard(_parms) {
    
    countSuccess = sessionActivity.filter(obj => {
        if (obj.status === 'success') {
          return true;
        }
        return false;
    }).length; 
    
    if (countSuccess === 0) {
        _parms.callback && _parms.callback({
            messageTitle: countSuccess+ ' of ' + postProcessedFiles.length + ' could be uploaded!',
            message:  'Please select another file.',
            messageColor: $.messagesLabel.errorColor,
            messageTitleColor: $.messagesTitleLabel.errorColor
        });           
        return;
    }
    Ti.App.addEventListener('resume', onResume);

    if (copiedUrls < countSuccess) {
        Ti.UI.Clipboard.clearText();
        if (sessionActivity[copiedUrls].status === 'success') {
            Ti.UI.Clipboard.setText(sessionActivity[copiedUrls].url); 
            copiedUrls++;
            setTimeout(()=>{
                alertDialogHelper.createTemporalMessage({
                    message: 'Link #' + copiedUrls + ' of ' + countSuccess + ' copied to clipboard.',
                    duration: 3000,
                    opacity: 0.8,
                    font: {
                        fontSize: 20
                    }
                }); 
            }, 500);            
            _parms.callback && _parms.callback({
                messageTitle: countSuccess+ ' of ' + postProcessedFiles.length + ' successfully uploaded!',
                message:  copiedUrls+ ' of ' + countSuccess + ' URLs copied to clipboard. Paste in FOPs' +  (countSuccess===1 ? '' : ' and come back to copy the next one.'),
                messageColor: $.messagesLabel.normalColor,
                messageTitleColor: $.messagesTitleLabel.successColor                
            });
        }
    } else {
        setTimeout(()=>{
            alertDialogHelper.createTemporalMessage({
                message: 'No more links to copy!',
                duration: 2000,
                opacity: 0.8,
                font: {
                    fontSize: 20
                }
            }); 
        }, 500);         
        _parms.callback && _parms.callback({
            messageTitle: countSuccess+ ' of ' + postProcessedFiles.length + ' successfully uploaded!',
            message:  copiedUrls+ ' of ' + countSuccess + ' URLs already copied.',
            messageColor: $.messagesLabel.normalColor,
            messageTitleColor: $.messagesTitleLabel.successColor               
        });        
    }

}

const configure = () => {
    Alloy.Globals.doLog({
        text: 'configure()',
        program: logProgram
    });    
    $.retakeButton.enabled = false;
    $.uploadButton.enabled = false;
    postProcessedFiles = [];
    sessionActivity = [];
    const _e = args.data;

    if (_e.success) {
        actualItem = 0; 
        foundImages = _e.images && _e.images.length > 0; 
        foundVideos = _e.videos && _e.videos.length > 0;
        if (foundImages && foundVideos) {
            processItem([..._e.images, ..._e.videos], _e.images.length + _e.videos.length);
        }else if (foundImages) {     
            processItem(_e.images, _e.images.length);
        } else if (foundVideos) {
            processItem(_e.videos, _e.videos.length);
        } else {
            processItem([_e], 1);
        }
    }    
}

function processItem(_items, _totalItems) {
    Alloy.Globals.doLog({
        text: 'processItem() total: '+_totalItems+ ' actual: '+actualItem,
        program: logProgram
    });     
    let _e = _items[actualItem];

    if(_e.mediaType === 'public.movie') {   
        Alloy.Globals.doLog({
            text: 'Item is a movie',
            program: logProgram
        });          
        if (!_e.success) {
            actualItem ++;
            if (actualItem < _totalItems) {
                return processItem(_items, _totalItems);
            }   

            doEndProcessing();            
            return;
        }
        var filename = 'movie_' + moment().format('YYYYMMDDhhmmssSSS') + '.mov';
        var outputFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
        if (!outputFile.write(_e.media)) {
            // handle write error
            console.error('Error: could not write video data to a file '+filename);
        }
        
        if(OS_IOS) {
            Ti.Media.exportVideo({
                url: outputFile.nativePath,
                quality: "medium"
            });
            Ti.Media.addEventListener('exportvideo:completed', function videoCompleted(_e) {
                Ti.Media.removeEventListener('exportvideo:completed', videoCompleted);
                postProcessedFile = {
                    blob: null,
                    name: filename,
                    url: _e.url,
                    type: 'video'
                };
                postProcessedFiles.push(postProcessedFile);

                actualItem ++;
                if (actualItem < _totalItems) {
                    return processItem(_items, _totalItems);
                }   

                doEndProcessing();
            });
        } else {
            postProcessedFile = {
                blob: _e.media,
                name: filename,
                url: outputFile.nativePath,
                type: 'video'
            };                
            postProcessedFiles.push(postProcessedFile);
            actualItem ++;
            if (actualItem < _totalItems) {
                return processItem(_items, _totalItems);
            } 
            
            doEndProcessing();
        }
        outputFile = null;

        
    } else if(_e.mediaType === 'public.image') {
        if (!_e.success) {
            actualItem ++;
            if (actualItem < _totalItems) {
                return processItem(_items, _totalItems);
            }   

            doEndProcessing();            
            return;
        }        
        //let isLandscape = _e.media.width > _e.media.height;
        let ratio = _e.media.width > _e.media.height ? _e.media.width/ _e.media.height: _e.media.height/ _e.media.width;
        let newW = desiredSize;
        let newH = newW * ratio;
        let resizedImage = _e.media.imageAsResized(newW, newH);

        var filename = 'photo_' + moment().format('YYYYMMDDhhmmssSSS') + '.png';
        var outputFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
        if (!outputFile.write(resizedImage)) {
            // handle write error
            console.error('Error: could not write photo data to a file');
        }               

        postProcessedFile = {
            name: filename,
            blob: resizedImage,
            url: outputFile.nativePath,
            type: 'photo'
        };   
        postProcessedFiles.push(postProcessedFile);    
        
        actualItem ++;
        if (actualItem < _totalItems) {
            return processItem(_items, _totalItems);
        } 
        
        doEndProcessing();
    }    
}

function doEndProcessing() {
    Alloy.Globals.doLog({
        text: 'doEndProcessing() items: ' + postProcessedFiles.length,
        program: logProgram
    });      
    postProcessedFiles.forEach(item => {
        if(item.type === 'photo') {
            let imageView = Ti.UI.createImageView({
                width: Ti.UI.SIZE,
                height: Ti.UI.SIZE,
                image: item.blob
            });   
            $.scrollableView.addView(imageView); 
        }
        if(item.type === 'video') {
            let imageView = Ti.Media.createVideoPlayer({
                autoplay: false,
                width: Ti.Platform.displayCaps.platformWidth,
                height: Ti.Platform.displayCaps.platformWidth,
                zIndex: 10,
                url: item.url
            });   
            $.scrollableView.addView(imageView); 
        }                                   
    });

    $.scrollableView.visible = true;
    $.retakeButton.enabled = true;
    $.uploadButton.enabled = true;     
}
configure();

const onUploadButtonClick = () => {
    Alloy.Globals.doLog({
        text: 'onUploadButtonClick() state: ' + state,
        program: logProgram
    });      
    if (state === 'done') {
        // retake
        args.onRetake && args.onRetake();
        $.win.close();
    } else {
        if (state !== 'error') {
            uploadedItems = 0;
            actualItem = 0;
        }
        doUploadFile();
    }
};
const onRetakeButtonClick = () => {
    Alloy.Globals.doLog({
        text: 'onRetakeButtonClick() state: '+state,
        program: logProgram
    });      
    if (state === 'done') {
        // recopy
        copiedUrls = 0;
        copyToClipboard({
            callback: (_result) => {
                $.messagesTitleLabel.color = _result.messageColor || $.messagesTitleLabel.successColor;
                $.messagesTitleLabel.text = _result.messageTitle;
    
                $.messagesLabel.color = _result.messageColor || $.messagesLabel.successColor;
                $.messagesLabel.text = _result.message;
                $.messagesLabel.animate(blinking);
                
                $.retakeButton.enabled = true;
                $.retakeButton.title = 'Re-copy';
            
                activityIndicator.hide();
                $.uploadButton.remove(activityIndicator);
                $.uploadButton.enabled = true;
                $.uploadButton.title = 'Take another'; 
            }
        });        
    } else {
        args.onRetake && args.onRetake();
        $.win.close();
    }
};

$.uploadButton.addEventListener('click', onUploadButtonClick);
$.retakeButton.addEventListener('click', onRetakeButtonClick);

$.win.addEventListener('open', ()=>{
    args.openControllers && args.openControllers.push($);
    Alloy.Globals.doLog({
        text: 'openControllers: ' +args.openControllers.length,
        program: logProgram
    });        
});

$.win.addEventListener('close', ()=>{
    args.openControllers && args.openControllers.pop($);
    Alloy.Globals.doLog({
        text: 'openControllers: ' + args.openControllers.length,
        program: logProgram
    });        
});