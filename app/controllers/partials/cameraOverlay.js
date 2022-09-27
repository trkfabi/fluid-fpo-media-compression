const appNavigation = require('appNavigation');
const args = $.args;
const logProgram = 'partials/cameraOverlay';

let snapButtonStatus = 'READY';    // DISABLED , RECORDING

const configure = () => {
    Alloy.Globals.doLog({
        text: 'configure()',
        program: logProgram
    });       
}
configure();

const onViewActivityClick = () => {
    appNavigation.openActivity();
}
$.viewActivityLabel.addEventListener('click', onViewActivityClick);

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
    if (args.isVideo) {
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
    if (args.isVideo) {

    } else {
        $.snapButton.backgroundImage = $.snapButton.customImageEnabled;
        $.snapButton.enabled = true;
        snapButtonStatus = 'READY';  
    }     
}