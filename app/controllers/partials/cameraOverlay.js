const moment = require('alloy/moment');
const alertDialogHelper = require("helpers/alertDialogHelper");
const args = $.args;
const logProgram = 'partials/cameraOverlay';

let snapButtonStatus = 'READY';    // DISABLED , RECORDING
let isVideo = args.mediaType === Ti.Media.MEDIA_TYPE_PHOTO? false: true;
let startRecordingTime;
let titleClicks = 0;

const configure = () => {
    Alloy.Globals.doLog({
        text: 'configure()',
        program: logProgram
    });       
    $.versionLabel.text = 'v: ' + Ti.App.version;
    $.mediaTypeButton.title = args.mediaType === Ti.Media.MEDIA_TYPE_PHOTO ? 'Switch to Video' : 'Switch to Photo';
    $.mediaTypeButton.visible = Alloy.Globals.allowVideoFiles;
    $.flashToggleButton.backgroundImage = Ti.Media.cameraFlashMode === Ti.Media.CAMERA_FLASH_ON ? $.flashToggleButton.customImageEnabled: $.flashToggleButton.customImageDisabled;
    Alloy.Globals.doLog({
        text: 'configure() - ended',
        program: logProgram
    });       
}
configure();

const onTitleClick = () => {
    $.versionLabel.backgroundColor = '#ccc';
    setTimeout(()=>{
        $.versionLabel.backgroundColor = 'transparent';
    }, 200);
    titleClicks++;
    Alloy.Globals.doLog({
        text: 'onTitleClick() - ' + titleClicks,
        program: logProgram
    });     
    if (titleClicks === 4) {
        titleClicks = 0;
        args.onConfigScreen();
    }
}
$.versionLabel.addEventListener('click', onTitleClick);


const onHistoryClick = () => {
    Alloy.Globals.doLog({
        text: 'onHistoryClick()',
        program: logProgram
    });            
    args.onHistory();
}
$.historyButton.addEventListener('click', onHistoryClick);

const onChangeMediaType = () => {
    Alloy.Globals.doLog({
        text: 'onChangeMediaType()',
        program: logProgram
    });       
    args.onChangeMediaType();
}
$.mediaTypeButton.addEventListener('click', onChangeMediaType);

const onFlashButtonClick = () => {
    Alloy.Globals.doLog({
        text: 'onFlashButtonClick() Ti.Media.cameraFlashMode: ' + Ti.Media.cameraFlashMode,
        program: logProgram
    });   
    args.onFlashToggle();
  
    $.flashToggleButton.backgroundImage = Ti.Media.cameraFlashMode === Ti.Media.CAMERA_FLASH_ON ? $.flashToggleButton.customImageEnabled: $.flashToggleButton.customImageDisabled;

}
$.flashToggleButton.addEventListener('click', onFlashButtonClick);

const updateRecordingTime = () => {
    let totalSeconds = moment().diff(startRecordingTime, 'seconds');
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    minutes = String(minutes).padStart(2, "0");
    hours = String(hours).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");
    
    $.recordingLabel.text = hours + ":" + minutes + ":" + seconds;
}
const onSnapButtonClick = () => {
    Alloy.Globals.doLog({
        text: 'onSnapButtonClick() snap status: ' + snapButtonStatus,
        program: logProgram
    });     
    if (args.mediaType === Ti.Media.MEDIA_TYPE_VIDEO) {
        if (snapButtonStatus === 'READY') {
            $.snapButton.backgroundImage = $.snapButton.customImageRecording;
            $.snapButton.enabled = true;
            $.thumb.visible = false;
            snapButtonStatus = 'RECORDING';
            $.recordingLabel.text = '00:00:00';
            $.recordingLabel.visible = true; 
            startRecordingTime = moment();
            recordingTimeInterval = setInterval(updateRecordingTime, 1000);
        } else {
            $.snapButton.backgroundImage = $.snapButton.customImageEnabled;
            $.snapButton.enabled = true;
            snapButtonStatus = 'READY';        
            $.recordingLabel.visible = false;  
            clearInterval(recordingTimeInterval);  
        }
    } else {
        if (snapButtonStatus === 'READY') {
            $.snapButton.backgroundImage = $.snapButton.customImageDisabled;
            $.snapButton.enabled = false;    
            $.thumb.visible = false;        
            snapButtonStatus = 'DISABLED';
        } else {
            $.snapButton.backgroundImage = $.snapButton.customImageEnabled;
            $.snapButton.enabled = true;          
            snapButtonStatus = 'READY';        
        }        
    }
    args.onSnap();
}
$.snapButton.addEventListener('click', onSnapButtonClick);


const onGalleryClick = () => {
    Alloy.Globals.doLog({
        text: 'onGalleryClick()',
        program: logProgram
    }); 
    if (Alloy.Globals.objectToProcess.images.length + Alloy.Globals.objectToProcess.videos.length > 0) {       
        alertDialogHelper.createConfirmDialog({
            title: 'Open gallery?',
            message: `Photos and videos taken will be lost.`,
            cancelActionCallback: () => {},
            confirmActionCallback: () => {
                Alloy.Globals.objectToProcess.images = [];
                Alloy.Globals.objectToProcess.videos = [];
                $.updateItemsLabel();
                args.onGallery();           
            }
        }).show();
    } else {
        args.onGallery();
    }
}
$.galleryButton.addEventListener('click', onGalleryClick);

$.updateItemsLabel = () => {
    let numberOfItems = Alloy.Globals.objectToProcess.images.length + Alloy.Globals.objectToProcess.videos.length;
    $.genericLabel.text = 'Items: ' + numberOfItems;      
}
$.onCameraDone = () => {
    Alloy.Globals.doLog({
        text: 'onCameraDone()',
        program: logProgram
    });     
    if (args.mediaType === Ti.Media.MEDIA_TYPE_VIDEO) {

    } else {
        $.snapButton.backgroundImage = $.snapButton.customImageEnabled;
        $.snapButton.enabled = true;
        snapButtonStatus = 'READY'; 
    }     
    $.updateItemsLabel();
}

const onNextButtonClick = () => {
    Alloy.Globals.doLog({
        text: 'onNextButtonClick()',
        program: logProgram
    });   
    let numberOfItems = Alloy.Globals.objectToProcess.images.length + Alloy.Globals.objectToProcess.videos.length;   
    if (numberOfItems > 0) {
        args.onNext();  
    } else {
        alertDialogHelper.createAlertDialog({
            title: 'No items found',
            message: 'One photo or video is required at least.'
        }).show();    
    }
}
$.nextButton.addEventListener('click', onNextButtonClick);

let lastChileView;
$.displayMessage = _data => {
    if (lastChileView) {
        $.hideMessage();
    }
    _data.viewParent = $.overlayContainer;
    _data.returnView = true;
    lastChileView = alertDialogHelper.createTemporalMessage(_data);
};
$.hideMessage = () => {
    let _data = {};
    _data.viewParent = $.overlayContainer;
    _data.viewChild = lastChileView;
    lastChileView = null;
    alertDialogHelper.hideMessage(_data);
};
$.displayThumb = (_data) => {
    if (Alloy.Globals.onlySaveToGallery) {
        if (_data.rotate) {
            var t = Ti.UI.createMatrix2D(); 
            var spin = Ti.UI.createAnimation();
            t = t.rotate(90);
            spin.transform = t;
            $.thumb.animate(spin);
        }
        $.thumb.image = _data.thumbnail;
        $.thumb.visible = _data.visible;
    }
}
