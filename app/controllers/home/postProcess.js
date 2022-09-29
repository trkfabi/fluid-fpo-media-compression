const moment = require('alloy/moment');
const api = require('api').api;
const alertDialogHelper = require("helpers/alertDialogHelper");
const logProgram = 'home/postProcess';
const args = $.args;

let activity = Alloy.Globals.activityHistory;

let postProcessedFile = {};
let desiredSize = 640;

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
	let uploadFile = postProcessedFile.blob; // Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, postProcessedFile.name);
    let fileSize = null;
    let fileSizeUnit = '';
	// if (!uploadFile.exists()){ 
    //     $.messagesLabel.color = $.messagesLabel.errorColor;
    //     $.messagesLabel.text = 'Error!\nCould not find file.'

    //     return false;
    // }
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
                name: postProcessedFile.name,
                url: _e.data && _e.data.data && _e.data.data.attributes && _e.data.data.attributes['large-sq'],
                file: postProcessedFile.url,
                size: fileSize + ' ' + fileSizeUnit,
                type: postProcessedFile.type,
                date: moment().format("MMM D, LTS"),
                videothumbnail: '/images/videofile.png',
                status: 'success' 
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
 
            activityIndicator.hide();
            $.uploadButton.remove(activityIndicator);
            $.uploadButton.enabled = true;
            $.uploadButton.title = 'Take another'; 
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
            
            activityIndicator.hide();
            $.uploadButton.remove(activityIndicator);
            $.uploadButton.enabled = true;
            $.uploadButton.title = 'Retry'; 

            let activityItem = {
                name: postProcessedFile.name,
                url: postProcessedFile.url,
                file: postProcessedFile.url,
                size: fileSize + ' ' + fileSizeUnit,
                type: postProcessedFile.type,
                date: moment().format("MMM D, LTS"),
                videothumbnail: '/images/videofile.png',
                status: 'error' 
            }; 
            postProcessedFile.publicUrl = '';

            activity.push(activityItem);
            Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
            Alloy.Globals.activityHistory = activity;            
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
                Ti.Media.addEventListener('exportvideo:completed', _e => {
                    postProcessedFile = {
                        blob: null,
                        name: filename,
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
                    blob: _e.media,
                    name: filename,
                    url: outputFile.nativePath,
                    type: 'video'
                };                
            }
            outputFile = null;
        } else {
            let isLandscape = _e.media.width > _e.media.height;
            let ratio = _e.media.width > _e.media.height ? _e.media.width/ _e.media.height: _e.media.height/ _e.media.width;
            let newW = desiredSize;
            let newH = newW * ratio;
            let resizedImage = _e.media.imageAsResized(newW, newH);

            // // this is just curiousity
            // var fileSizeOri = _e.media.size/1024;
            // fileSizeOri = fileSizeOri.toFixed(2);
            // var fileSizeOriUnit = 'kb';
            // if (Math.trunc(fileSizeOri/1024) > 0) {
            //     fileSizeOri = fileSizeOri/1024;
            //     fileSizeOri = fileSizeOri.toFixed(2);
            //     fileSizeOriUnit = 'mb';
            // }
        
            // var fileSizeNew = resizedImage.size/1024;
            // fileSizeNew = fileSizeNew.toFixed(2);
            // var fileSizeNewUnit = 'kb';
            // if (Math.trunc(fileSizeNew/1024) > 0) {
            //     fileSizeNew = fileSizeNew/1024;
            //     fileSizeNew = fileSizeNew.toFixed(2);
            //     fileSizeNewUnit = 'mb';
            // }
            
            // console.warn(`Original: isLandscape: ${isLandscape} - ${fileSizeOri} ${fileSizeOriUnit} ${_e.media.width}x${_e.media.height} Resized: ${fileSizeNew} ${fileSizeNewUnit} ${newW}x${newH}`);    
            ////////

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
                name: filename,
                blob: resizedImage,
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
        alertDialogHelper.createTemporalMessage({
            message: 'URL copied to clipboard',
            duration: 2000,
            opacity: 0.8,
            font: {
                fontSize: 20
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