const moment = require('alloy/moment');
const api = require('api').api;
const logProgram = 'home/postProcess';
const args = $.args;

let activity = Alloy.Globals.activityHistory;

let postProcessedFile = {};
let desiredSize = {
    w: 640,
    h: 640
};
let state = 'ready'; // uploading , done 

const activityIndicator = Ti.UI.createActivityIndicator({
    color: '#FFFFFF',
    style: Ti.UI.ActivityIndicatorStyle.PLAIN,
    left: 40,
    height: Ti.UI.SIZE,
    width: Ti.UI.SIZE
});

const doUploadFile = _parms => {
    Alloy.Globals.doLog({
        text: 'doUploadFile()',
        program: logProgram
    });       
	let uploadFile  = Ti.Filesystem.getFile(postProcessedFile.url);
    let fileSize = null;
	if (!uploadFile.exists()){ 
        $.messagesLabel.color = $.messagesLabel.errorColor;
        $.messagesLabel.text = 'Error!\nCould not find file.'

        return false;
    }
    $.retakeButton.enabled = false;
    $.uploadButton.enabled = false;
    $.uploadButton.title = 'Uploading...';
    $.uploadButton.add(activityIndicator);
    activityIndicator.show();
    state = 'uploading';

    fileSize = Math.round(uploadFile.size/1024/1024, 2);
 
    api.media.upload({
        media: uploadFile,
        onSuccess: _e => {
            Alloy.Globals.doLog({
                text: 'Upload success: ' + JSON.stringify(_e),
                program: logProgram
            });
            state = 'done';
            // large-sq is 1024x1024
            // url is 640x640
            let activityItem = {
                url: _e.data && _e.data.data && _e.data.data.attributes && _e.data.data.attributes['large-sq'],
                file: postProcessedFile.url,
                size: fileSize + ' Mb',
                type: postProcessedFile.type,
                date: moment().format("MMM D, LT"),
                status: 'success' // check API response
            };
            postProcessedFile.publicUrl = activityItem.url;
            activity.push(activityItem);
            Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
            Alloy.Globals.activityHistory = activity;

            Ti.UI.Clipboard.clearText();
            Ti.UI.Clipboard.setText(activityItem.url);

            $.messagesLabel.color = $.messagesLabel.successColor;
            $.messagesLabel.text = 'Success!\nURL copied to clipboard. Paste in FOPs'
            
            $.retakeButton.enabled = true;
            $.retakeButton.title = 'Re-copy';
            //$.retakeButton.image = $.retakeButton.customRecopyImage;

            activityIndicator.hide();
            $.uploadButton.remove(activityIndicator);
            $.uploadButton.enabled = true;
            $.uploadButton.title = 'Take another'; 
            //$.uploadButton.image = $.uploadButton.customRetakeImage; 
        },
        onError: _e => {
            Alloy.Globals.doLog({
                text: 'Upload error: ' + JSON.stringify(_e),
                program: logProgram
            });
            state = 'error';
            Ti.UI.Clipboard.clearText();

            $.messagesLabel.color = $.messagesLabel.errorColor;
            $.messagesLabel.text = 'Error!\nCould not upload file.'
            
            $.retakeButton.enabled = true;
            //$.retakeButton.image = $.retakeButton.customRetakeImage;
            
            activityIndicator.hide();
            $.uploadButton.remove(activityIndicator);
            $.uploadButton.enabled = true;
            $.uploadButton.title = 'Retry'; 
            //$.uploadButton.image = $.uploadButton.customRetryImage; 

        }
    });

};

const configure = () => {
    Alloy.Globals.doLog({
        text: 'configure()',
        program: logProgram
    });    
    $.retakeButton.enabled = false;
    $.uploadButton.enabled = false;

    const _e = args.data;

    if (_e.success) {
        if(_e.mediaType === 'public.movie') {           
            var filename = 'movie_' + moment().format('YYYYMMDDhhmmss') + '.mov';
            var outputFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
            if (!outputFile.write(_e.media)) {
                // handle write error
                console.error('Error: could not write video data to a file');
            }
            
            if(OS_IOS) {
                Ti.Media.exportVideo({
                    url: outputFile.nativePath,
                    quality: "medium"
                });
                Ti.Media.addEventListener('exportvideo:completed', _e=>{
                    postProcessedFile = {
                        url: _e.url,
                        type: 'video'
                    };
                    $.retakeButton.enabled = true;
                    $.uploadButton.enabled = true;
                    $.videoPreview.url = _e.url;
                    $.videoPreview.visible = true;
                });
            } else {
                postProcessedFile = {
                    url: outputFile.nativePath,
                    type: 'video'
                };                
            }
            outputFile = null;
        } else {
            // picture
            // let croppedW = _e.media.width > _e.media.height ? _e.media.height: _e.media.width;
            // let croppedH = croppedW;
            // console.warn('croppedW: '+croppedW+ ' croppedH: '+ croppedH + ' s: '+_e.media.size);
            // let croppedImage = _e.media.imageAsCropped({
            //     width: croppedW, 
            //     height: croppedH,
            //     x: 0,
            //     y: 0 
            // });

            let ratio = _e.media.width > _e.media.height ? _e.media.width/ _e.media.height: _e.media.height/ _e.media.width;
            let newW = _e.media.width > _e.media.height ? desiredSize.w : desiredSize.h;
            let newH = newW * ratio;
            let resizedImage = _e.media.imageAsResized(newW, newH);

            // console.warn('ori w: '+_e.media.width+ ' h: '+ _e.media.height + ' bf s: '+_e.media.size);
            // console.warn('new w: '+resizedImage.width+ ' h: '+ resizedImage.height + ' after s: '+resizedImage.size);

            var filename = 'photo_' + moment().format('YYYYMMDDhhmmss') + '.png';
            var outputFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
            if (!outputFile.write(resizedImage)) {
                // handle write error
                console.error('Error: could not write photo data to a file');
            }               
            $.imagePreview.visible = true;
            $.imagePreview.image = resizedImage;

            $.retakeButton.enabled = true;
            $.uploadButton.enabled = true;
            postProcessedFile = {
                url: outputFile.nativePath,
                type: 'photo'
            };                            
        }
    }    
}

configure();

const onUploadButtonClick = () => {
    Alloy.Globals.doLog({
        text: 'onUploadButtonClick()',
        program: logProgram
    });      
    if (state === 'done') {
        // retake
        args.onRetake && args.onRetake();
        $.win.close();
    } else {
        doUploadFile();
    }
};
const onRetakeButtonClick = () => {
    Alloy.Globals.doLog({
        text: 'onRetakeButtonClick()',
        program: logProgram
    });      
    if (state === 'done') {
        // recopy
        Ti.UI.Clipboard.clearText();
        Ti.UI.Clipboard.setText(postProcessedFile.publicUrl);
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