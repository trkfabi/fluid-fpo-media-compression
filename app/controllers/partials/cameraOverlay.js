const appNavigation = require('appNavigation');
const args = $.args;
const logProgram = 'partials/cameraOverlay';

let snapButtonStatus = 'READY';    // DISABLED , RECORDING
let isVideo = args.mediaType === Ti.Media.MEDIA_TYPE_PHOTO? false: true;

const configure = () => {
    Alloy.Globals.doLog({
        text: 'configure()',
        program: logProgram
    });       
    $.mediaTypeButton.title = args.mediaType === Ti.Media.MEDIA_TYPE_PHOTO ? 'Switch to Video' : 'Switch to Photo';
    $.flashToggleButton.backgroundImage = Ti.Media.cameraFlashMode === Ti.Media.CAMERA_FLASH_ON ? $.flashToggleButton.customImageEnabled: $.flashToggleButton.customImageDisabled;
}
configure();

const onViewActivityClick = () => {
    appNavigation.openActivity();
}
$.viewActivityLabel.addEventListener('click', onViewActivityClick);

const onChangeMediaType = () => {
    Alloy.Globals.doLog({
        text: 'onChangeMediaType() isVideo: ' + isVideo,
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
        } else {
            $.snapButton.backgroundImage = $.snapButton.customImageEnabled;
            $.snapButton.enabled = true;
            snapButtonStatus = 'READY';            
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