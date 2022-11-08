const appNavigation = require('appNavigation');
const hapticFeedbackHelper = require('helpers/hapticFeedbackHelper');
const logProgram = 'home/cameraScreen';
const args = $.args;

let isRecording = false;
let isLandscape = Ti.Gesture.landscape;

const checkStoragePermissions = () => {
    Alloy.Globals.doLog({
        text: 'checkStoragePermissions()',
        program: logProgram
    }); 
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
        cameraFlashMode: Ti.Media.CAMERA_FLASH_OFF,
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
                if (!Alloy.Globals.allowVideoFiles) {
                    alert('Video upload not supported yet');
                    return false;
                }
                _mediaType = Titanium.Media.MEDIA_TYPE_VIDEO;
            } else {
                _mediaType = Titanium.Media.MEDIA_TYPE_PHOTO;
            }
            Ti.Media.hideCamera();
            setTimeout(function(){
                openCamera(_mediaType);
            }, 1000);
            
        },
        onHistory: () => {
            Ti.Media.hideCamera();
            appNavigation.openActivity({
                onClose: openCamera
            });            
        }
    });

    Alloy.Globals.doLog({
        text: 'overlay created',
        program: logProgram
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
            Alloy.Globals.doLog({
                text: 'Camera success: ' + JSON.stringify(_e),
                program: logProgram
            }); 
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
            Alloy.Globals.doLog({
                text: 'Camera error: ' + JSON.stringify(_e),
                program: logProgram
            }); 
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
        allowMultiple: true,
        mediaTypes: Alloy.Globals.allowVideoFiles ? [Titanium.Media.MEDIA_TYPE_PHOTO, Titanium.Media.MEDIA_TYPE_VIDEO]: [Titanium.Media.MEDIA_TYPE_PHOTO], 
        allowTranscoding: false,	// if this is false, videoQuality does not matter (full quality)
        videoQuality: Ti.Media.QUALITY_MEDIUM,
        success: _e => {
            Alloy.Globals.doLog({
                text: 'Gallery success: ' + JSON.stringify(_e),
                program: logProgram
            });             
            appNavigation.openPostProcess({
                data: _e,
                onRetake: function() {
                    openCamera(Titanium.Media.MEDIA_TYPE_PHOTO);
                }
            });
        },
        error: _e => {
            Alloy.Globals.doLog({
                text: 'Gallery error: ' + JSON.stringify(_e),
                program: logProgram
            }); 
        },
        cancel: _e => {
            Alloy.Globals.doLog({
                text: 'Gallery cancel: ' + JSON.stringify(_e),
                program: logProgram
            });             
            openCamera(Titanium.Media.MEDIA_TYPE_PHOTO);
        }
    });     
}

const checkCameraPermissions = () => {
    Alloy.Globals.doLog({
        text: 'checkCameraPermissions()',
        program: logProgram
    });        
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

// Titanium.Gesture.addEventListener('orientationchange', e => {
//     console.warn(JSON.stringify(e));
//     if (!isLandscape && Ti.Gesture.landscape) {
//         // changed
//         console.warn('changed to landscape');
//         Ti.Media.hideCamera();
//         openCamera();
//     }
//     if (isLandscape && Ti.Gesture.portrait) {
//         // changed
//         console.warn('changed to portrait');
//         Ti.Media.hideCamera();
//         openCamera();
//     }
//     isLandscape = Ti.Gesture.landscape;
// });