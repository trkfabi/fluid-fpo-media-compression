const moment = require('alloy/moment');
const args = $.args;
const logProgram = 'partials/cameraOverlay';

let snapButtonStatus = 'READY';    // DISABLED , RECORDING
let isVideo = args.mediaType === Ti.Media.MEDIA_TYPE_PHOTO? false: true;
let startRecordingTime;

const configure = () => {
    Alloy.Globals.doLog({
        text: 'configure()',
        program: logProgram
    });       
    $.mediaTypeButton.title = args.mediaType === Ti.Media.MEDIA_TYPE_PHOTO ? 'Switch to Video' : 'Switch to Photo';
    $.mediaTypeButton.visible = Alloy.Globals.allowVideoFiles;
    $.flashToggleButton.backgroundImage = Ti.Media.cameraFlashMode === Ti.Media.CAMERA_FLASH_ON ? $.flashToggleButton.customImageEnabled: $.flashToggleButton.customImageDisabled;
    Alloy.Globals.doLog({
        text: 'configure() - ended',
        program: logProgram
    });       
}
configure();

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
    
    $.recordingTime.text = hours + ":" + minutes + ":" + seconds;
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
            snapButtonStatus = 'RECORDING';
            $.recordingTime.text = '00:00:00';
            $.recordingTime.visible = true; 
            startRecordingTime = moment();
            recordingTimeInterval = setInterval(updateRecordingTime, 1000);
        } else {
            $.snapButton.backgroundImage = $.snapButton.customImageEnabled;
            $.snapButton.enabled = true;
            snapButtonStatus = 'READY';        
            $.recordingTime.visible = false;  
            clearInterval(recordingTimeInterval);  
        }
    } else {
        if (snapButtonStatus === 'READY') {
            $.snapButton.backgroundImage = $.snapButton.customImageDisabled;
            $.snapButton.enabled = false;
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
    args.onGallery();
}
$.galleryButton.addEventListener('click', onGalleryClick);

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
}