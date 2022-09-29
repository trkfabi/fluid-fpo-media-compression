const moment = require('alloy/moment');
const logProgram = 'lib/helpers/helper';

var helper = (function () {

    function checkCameraPermission() {
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
            Ti.Android.requestPermissions("android.permission.WRITE_EXTERNAL_STORAGE", function (e) {
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

    const uploadFile = _parms => {
        Alloy.Globals.doLog({
            text: 'uploadFile() URL: ' + JSON.stringify(_parms),
            program: logProgram
        });       
        let postProcessedFile = _parms.file;

        let uploadFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, postProcessedFile.name);
        let fileSize = null;
        let fileSizeUnit = '';
        if (!uploadFile.exists()) {     
            return false;
        }
        uploadFile = uploadFile.read();

        fileSize = uploadFile.size/1024;
        fileSize = fileSize.toFixed(2);
        fileSizeUnit = 'kb';
        if (Math.trunc(fileSize/1024) > 0) {
            fileSize = fileSize/1024;
            fileSize = fileSize.toFixed(2);
            fileSizeUnit = 'mb';
        }
        const api = require('api').api;
        api.media.upload({
            media: uploadFile,
            onSuccess: _e => {
                Alloy.Globals.doLog({
                    text: 'Upload success: ' + JSON.stringify(_e),
                    program: logProgram
                });
                // large-sq is 1024x1024
                // url is 640x640
                let activityItem = {
                    url: _e.data && _e.data.data && _e.data.data.attributes && _e.data.data.attributes['large-sq'],
                    file: postProcessedFile.url,
                    size: fileSize + ' ' + fileSizeUnit,
                    type: postProcessedFile.type,
                    date: moment().format("MMM D, LTS"),
                    videothumbnail: '/images/videofile.png',
                    status: 'success',
                    name: postProcessedFile.name
                };
                _parms.onSuccess && _parms.onSuccess({
                    item: activityItem
                });
            },
            onError: _e => {
                Alloy.Globals.doLog({
                    text: 'Upload error: ' + JSON.stringify(_e),
                    program: logProgram
                });
                
                let activityItem = {
                    url: postProcessedFile.url,
                    file: postProcessedFile.url,
                    size: fileSize + ' ' + fileSizeUnit,
                    type: postProcessedFile.type,
                    date: moment().format("MMM D, LTS"),
                    videothumbnail: '/images/videofile.png',
                    status: 'error',
                    name: postProcessedFile.name
                };            
                _parms.onError && _parms.onError({
                    item: activityItem,
                    error: _e
                });
            }
        });
    };    

    return {
        checkCameraPermission: checkCameraPermission,
        uploadFile: uploadFile
    };
})();

module.exports = helper;