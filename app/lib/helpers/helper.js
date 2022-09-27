var helper = (function () {

    function checkCameraPersmission() {
        if (OS_IOS) {
            if (Ti.Media.hasCameraPermissions() && Ti.Media.hasAudioRecorderPermissions()) {
                return true;
            } else {
                Ti.Media.requestCameraPermissions(function (event) {
                    if (!event.success) {
                        return false;
                    }
                    Ti.Media.requestAudioRecorderPermissions(function (event2) {
                        if (!event2.success) {
                            return false;
                        }
                        return true;
                    });
                });
            }
        } else {
            if (!Ti.Media.hasCameraPermissions()) {
                Ti.Media.requestCameraPermissions(function (e) {
                    if (e.success) {
                        return checkStoragePermissions();
                    } else {
                        alert('No camera access allowed');
                        return false;
                    }
                });

            } else {
                return checkStoragePermissions();
            }

        }
    }

    function checkStoragePermissions() {

        if (!Ti.Android.hasPermission("android.permission.WRITE_EXTERNAL_STORAGE")) {
            console.log("Missing external storage permission.");
            Ti.Android.requestPermissions("android.permission.WRITE_EXTERNAL_STORAGE", function (e) {
                console.log(e);
                if (e.success) {
                    return true;
                } else {
                    return false;
                }
            });
        } else {
            return true;
        }
    }


    return {
        checkCameraPersmission: checkCameraPersmission

    };
})();

module.exports = helper;