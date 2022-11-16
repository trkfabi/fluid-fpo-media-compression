const appNavigation = require('appNavigation');
const hapticFeedbackHelper = require('helpers/hapticFeedbackHelper');
const alertDialogHelper = require("helpers/alertDialogHelper");
const logProgram = 'home/cameraScreen';
const args = $.args;

let isRecording = false;
let isLandscape = Ti.Gesture.landscape;
Alloy.Globals.objectToProcess = {
    success: true,
    videos: [],
    images: []
};

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
        },
        onNext: () => {

            var anyValid = false;
            if (Alloy.Globals.objectToProcess.images && Alloy.Globals.objectToProcess.images.length > 0) {
                const validImages = Alloy.Globals.objectToProcess.images.filter(obj => {
                    if (obj.success) {
                        return true;
                    }
                    return false;
                }).length; 
                if (validImages > 0) {
                    anyValid = true;
                }
            }; 
            if (!anyValid && Alloy.Globals.objectToProcess.videos && Alloy.Globals.objectToProcess.videos.length > 0) {
                const validVideos = Alloy.Globals.objectToProcess.videos.filter(obj => {
                    if (obj.success) {
                        return true;
                    }
                    return false;
                }).length; 
                if (validVideos > 0) {
                    anyValid = true;
                }
            };  
            if (anyValid) {
                Ti.Media.hideCamera();
                appNavigation.openPostProcess({
                    data: Alloy.Globals.objectToProcess,
                    onRetake: function() {
                        Alloy.Globals.objectToProcess.images = [];
                        Alloy.Globals.objectToProcess.videos = [];
                        openCamera(_mediaType);
                    }
                }); 
            } else {
                alertDialogHelper.createTemporalMessage({
                    message: 'Error: no valid files found.',
                    duration: 2000,
                    opacity: 0.8,
                    font: {
                        fontSize: 20
                    }
                });                     
            }
        
            
        }
    });

    Alloy.Globals.doLog({
        text: 'overlay created',
        program: logProgram
    });  
    cameraOverlayController.updateItemsLabel();

    if (Ti.App.deployType === 'development') {
        $.container.add(cameraOverlayController.getView());
        return;
    }
    var transformTranslate = Ti.UI.createMatrix2D().translate(0, 100);//.scale(1, 0.745);
    Ti.Media.showCamera({
        cameraFlashMode: Ti.Media.CAMERA_FLASH_OFF,
        showControls: false,
        overlay: cameraOverlayController.getView(),
        allowEditing: false,
        autohide: false,
        mediaTypes: _mediaType && _mediaType === Ti.Media.MEDIA_TYPE_PHOTO ? [Ti.Media.MEDIA_TYPE_PHOTO]: [Ti.Media.MEDIA_TYPE_VIDEO], //Titanium.Media.MEDIA_TYPE_VIDEO, 
        allowTranscoding: false,	// if this is false, videoQuality does not matter (full quality)
        videoQuality: Ti.Media.QUALITY_MEDIUM,
        transform: transformTranslate,
        success: _e => {
            Alloy.Globals.doLog({
                text: 'Camera success: ' + JSON.stringify(_e),
                program: logProgram
            }); 
            

            if (Alloy.Globals.allowMulitpleFiles) {
                if (_mediaType === Ti.Media.MEDIA_TYPE_PHOTO) {
                    Alloy.Globals.objectToProcess.images.push(_e);
                } else {
                    Alloy.Globals.objectToProcess.videos.push(_e);
                }
                cameraOverlayController.onCameraDone();
            } else {
                cameraOverlayController.onCameraDone();
                if (_e.success) {
                    var anyValid = false;
                    if (_e.images && _e.images.length > 0) {
                        const validImages = _e.images.filter(obj => {
                            if (obj.success) {
                              return true;
                            }
                            return false;
                        }).length; 
                        if (validImages > 0) {
                            anyValid = true;
                        }
                    }; 
                    if (!anyValid && _e.videos && _e.videos.length > 0) {
                        const validVideos = _e.videos.filter(obj => {
                            if (obj.success) {
                              return true;
                            }
                            return false;
                        }).length; 
                        if (validVideos > 0) {
                            anyValid = true;
                        }
                    };  
                    if (anyValid) {
                        Ti.Media.hideCamera();
                        appNavigation.openPostProcess({
                            data: _e,
                            onRetake: function() {
                                openCamera(_mediaType);
                            }
                        });  
                    } else {
                        alertDialogHelper.createTemporalMessage({
                            message: 'Error: no valid files found.',
                            duration: 2000,
                            opacity: 0.8,
                            font: {
                                fontSize: 20
                            }
                        });                     
                    }
                } else {
                    alertDialogHelper.createTemporalMessage({
                        message: 'Error: no valid files found.',
                        duration: 2000,
                        opacity: 0.8,
                        font: {
                            fontSize: 20
                        }
                    });                     
                }                       
              
            }

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
        allowMultiple: Alloy.Globals.allowMulitpleFiles,
        mediaTypes: Alloy.Globals.allowVideoFiles ? [Titanium.Media.MEDIA_TYPE_PHOTO, Titanium.Media.MEDIA_TYPE_VIDEO]: [Titanium.Media.MEDIA_TYPE_PHOTO], 
        allowTranscoding: false,	// if this is false, videoQuality does not matter (full quality)
        videoQuality: Ti.Media.QUALITY_MEDIUM,
        success: _e => {
            Alloy.Globals.doLog({
                text: 'Gallery success: ' + JSON.stringify(_e),
                program: logProgram
            });             

            if (_e.success) {
                var anyValid = false;
                if (_e.images && _e.images.length > 0) {
                    const validImages = _e.images.filter(obj => {
                        if (obj.success) {
                          return true;
                        }
                        return false;
                    }).length; 
                    if (validImages > 0) {
                        anyValid = true;
                    }
                }; 
                if (!anyValid && _e.videos && _e.videos.length > 0) {
                    const validVideos = _e.videos.filter(obj => {
                        if (obj.success) {
                          return true;
                        }
                        return false;
                    }).length; 
                    if (validVideos > 0) {
                        anyValid = true;
                    }
                };  
                if (anyValid) {
                    appNavigation.openPostProcess({
                        data: _e,
                        onRetake: function() {
                            openCamera(Titanium.Media.MEDIA_TYPE_PHOTO);
                        }
                    });
                } else {
                    alertDialogHelper.createTemporalMessage({
                        message: 'Error: no valid files found.',
                        duration: 2000,
                        opacity: 0.8,
                        font: {
                            fontSize: 20
                        }
                    });                     
                }
            } else {
                alertDialogHelper.createTemporalMessage({
                    message: 'Error: no valid files found.',
                    duration: 2000,
                    opacity: 0.8,
                    font: {
                        fontSize: 20
                    }
                });                     
            }             

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