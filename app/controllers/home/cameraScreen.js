const appNavigation = require('appNavigation');
const hapticFeedbackHelper = require('helpers/hapticFeedbackHelper');
const logProgram = 'home/cameraScreen';
const args = $.args;

let isRecording = false;

const checkStoragePermissions = () => {

    if (!Ti.Android.hasPermission("android.permission.WRITE_EXTERNAL_STORAGE")) {
        Ti.Android.requestPermissions("android.permission.WRITE_EXTERNAL_STORAGE", function (e) {
            if (e.success) {
                $.cameraPermission.visible = false;
                openCamera(Titanium.Media.MEDIA_TYPE_PHOTO);                
            } else {
                $.cameraPermission.visible = true;
                return false;
            }
        });
    } else {
        $.cameraPermission.visible = false;
        openCamera(Titanium.Media.MEDIA_TYPE_PHOTO); 
    }
};

const openCamera = (_mediaType) => {
    _mediaType = _mediaType || Ti.Media.MEDIA_TYPE_PHOTO;
    Alloy.Globals.doLog({
        text: 'openCamera() type: '+_mediaType,
        program: logProgram
    });      

    let cameraOverlayController = Alloy.createController('partials/cameraOverlay', {
        mediaType: _mediaType,
        onFlashToggle: () => {
            if (Ti.Media.cameraFlashMode === Ti.Media.CAMERA_FLASH_ON) {
                Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
            } else {
                Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
            }
        },
        onSnap: () => {
            hapticFeedbackHelper.impact();
            if (_mediaType === Titanium.Media.MEDIA_TYPE_PHOTO) {
                Ti.Media.takePicture();
            } else {
                if (isRecording) {
                    Ti.Media.stopVideoCapture();                    
                } else {
                    Ti.Media.startVideoCapture(); 
                }
                isRecording = !isRecording;
            }
        },
        onGallery: () => {
            if (Ti.Media.hasPhotoGalleryPermissions()) {
                openGallery();
            } else {
                Ti.Media.requestPhotoGalleryPermissions(function(event){
                    if (!event.success) {
                        return false;
                    }                
                    openGallery();
                });
            }
        },
        onChangeMediaType: () => {
            if (_mediaType === Titanium.Media.MEDIA_TYPE_PHOTO) {
                _mediaType = Titanium.Media.MEDIA_TYPE_VIDEO;
            } else {
                _mediaType = Titanium.Media.MEDIA_TYPE_PHOTO;
            }
            Ti.Media.hideCamera();
            openCamera(_mediaType);
        }
    });

    var transformTranslate = Ti.UI.createMatrix2D().translate(0, 100);//.scale(1, 0.745);
    Ti.Media.showCamera({
        cameraFlashMode: Ti.Media.CAMERA_FLASH_OFF,
        showControls: false,
        overlay: cameraOverlayController.getView(),
        allowEditing: false,
        autohide: false,
        allowMultiple: false,
        mediaTypes: _mediaType && _mediaType === Ti.Media.MEDIA_TYPE_PHOTO ? [Ti.Media.MEDIA_TYPE_PHOTO]: [Ti.Media.MEDIA_TYPE_VIDEO], //Titanium.Media.MEDIA_TYPE_VIDEO, 
        allowTranscoding: false,	// if this is false, videoQuality does not matter (full quality)
        videoQuality: Ti.Media.QUALITY_MEDIUM,
        transform: transformTranslate,
        success: _e => {
            console.error('showCamera success: ' + JSON.stringify(_e));
            cameraOverlayController.onCameraDone();
            Ti.Media.hideCamera();
            appNavigation.openPostProcess({
                data: _e,
                onRetake: function() {
                    openCamera(_mediaType);
                }
            });
        },
        error: _e => {
            cameraOverlayController.onCameraDone();
            console.error('showCamera error: ' +JSON.stringify(_e));
        }
    });    
};


const openGallery = () => {
    Alloy.Globals.doLog({
        text: 'openGallery()',
        program: logProgram
    });    
    Ti.Media.hideCamera();
    Ti.Media.openPhotoGallery({
        allowEditing: false,
        autohide: true,
        allowMultiple: false,
        mediaTypes: [Titanium.Media.MEDIA_TYPE_PHOTO, Titanium.Media.MEDIA_TYPE_VIDEO], 
        allowTranscoding: false,	// if this is false, videoQuality does not matter (full quality)
        videoQuality: Ti.Media.QUALITY_MEDIUM,
        success: _e => {
            console.error('openPhotoGallery success: ' + JSON.stringify(_e));
            appNavigation.openPostProcess({
                data: _e,
                onRetake: function() {
                    openCamera(Titanium.Media.MEDIA_TYPE_PHOTO);
                }
            });
        },
        error: _e => {
            console.error('openPhotoGallery error: ' +JSON.stringify(_e));
        },
        cancel: ()=>{
            openCamera(Titanium.Media.MEDIA_TYPE_PHOTO);
        }
    });     
}

const checkCameraPermissions = () => {
    if (OS_IOS) {
        if (Ti.Media.hasCameraPermissions() && Ti.Media.hasAudioRecorderPermissions()) {
            $.cameraPermission.visible = false;
            openCamera(Titanium.Media.MEDIA_TYPE_PHOTO);
        } else {
            Ti.Media.requestCameraPermissions(function (event) {
                if (!event.success) {
                    $.cameraPermission.visible = true;
                    return false;
                }
                Ti.Media.requestAudioRecorderPermissions(function (event2) {
                    if (!event2.success) {
                        $.cameraPermission.visible = true;
                        return false;
                    }
                    openCamera(Titanium.Media.MEDIA_TYPE_PHOTO);
                });
            });
        }
    } else {
        if (!Ti.Media.hasCameraPermissions()) {
            Ti.Media.requestCameraPermissions(function (e) {
                if (e.success) {
                    return checkStoragePermissions();
                } else {
                    $.cameraPermission.visible = true;
                    return false;
                }
            });

        } else {
            return checkStoragePermissions();
        }

    }        
}
const configure = () => {

    Alloy.Globals.doLog({
        text: 'configure()',
        program: logProgram
    });

};

configure();

$.cameraPermission.addEventListener('click', configure);

$.win.addEventListener('open', ()=>{
    args.openControllers && args.openControllers.push($);
    Alloy.Globals.doLog({
        text: 'openControllers: ' +args.openControllers.length,
        program: logProgram
    });    
    checkCameraPermissions();

});

$.win.addEventListener('close', ()=>{
    args.openControllers && args.openControllers.pop($);
    Alloy.Globals.doLog({
        text: 'openControllers: ' + args.openControllers.length,
        program: logProgram
    });        
});