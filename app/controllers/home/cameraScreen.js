const appNavigation = require('appNavigation');
const api = require('api').api;
const logProgram = 'home/cameraScreen';
const args = $.args;

let activity = Alloy.Globals.activityHistory;

const checkStoragePermissions = () => {

    if (!Ti.Android.hasPermission("android.permission.WRITE_EXTERNAL_STORAGE")) {
        Ti.Android.requestPermissions("android.permission.WRITE_EXTERNAL_STORAGE", function (e) {
            if (e.success) {
                $.cameraPermission.visible = false;
                openCamera();                
            } else {
                $.cameraPermission.visible = true;
                return false;
            }
        });
    } else {
        $.cameraPermission.visible = false;
        openCamera(); 
    }
};

const openCamera = () => {
    Alloy.Globals.doLog({
        text: 'openCamera()',
        program: logProgram
    });      
    let cameraOverlayController = Alloy.createController('partials/cameraOverlay', {
        onFlashToggle: () => {
            console.warn('Ti.Media.cameraFlashMode: ' + Ti.Media.cameraFlashMode);
            if (Ti.Media.cameraFlashMode === Ti.Media.CAMERA_FLASH_ON) {
                Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
            } else {
                Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
            }
        },
        onSnap: () => {
            Ti.Media.takePicture();
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
        }
    });

    var transformTranslate = Ti.UI.createMatrix2D().translate(0, 100);
    Ti.Media.showCamera({
        cameraFlashMode: Ti.Media.CAMERA_FLASH_OFF,
        showControls: false,
        overlay: cameraOverlayController.getView(),
        allowEditing: false,
        autohide: false,
        allowMultiple: false,
        mediaTypes: [Titanium.Media.MEDIA_TYPE_PHOTO], //Titanium.Media.MEDIA_TYPE_VIDEO, 
        allowTranscoding: false,	// if this is false, videoQuality does not matter (full quality)
        videoQuality: Ti.Media.QUALITY_MEDIUM,
        transform: transformTranslate,
        success: _e => {
            console.error('showCamera success: ' + JSON.stringify(_e));
            cameraOverlayController.onCameraDone();
            Ti.Media.hideCamera();
            appNavigation.openPostProcess({
                data: _e,
                onRetake: checkCameraPermissions
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
        mediaTypes: [Titanium.Media.MEDIA_TYPE_PHOTO], //Titanium.Media.MEDIA_TYPE_VIDEO, 
        allowTranscoding: false,	// if this is false, videoQuality does not matter (full quality)
        videoQuality: Ti.Media.QUALITY_MEDIUM,
        success: _e => {
            console.error('openPhotoGallery success: ' + JSON.stringify(_e));
            appNavigation.openPostProcess({
                data: _e,
                onRetake: checkCameraPermissions
            });
        },
        error: _e => {
            console.error('openPhotoGallery error: ' +JSON.stringify(_e));
        }
    });     
}

const checkCameraPermissions = () => {
    if (OS_IOS) {
        if (Ti.Media.hasCameraPermissions() && Ti.Media.hasAudioRecorderPermissions()) {
            $.cameraPermission.visible = false;
            openCamera();
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
                    openCamera();
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