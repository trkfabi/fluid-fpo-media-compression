import TiFirebaseCore from 'firebase.core';
import FirebaseStorage from 'firebase.storage';
const logProgram = 'lib/helpers/firebaseStorageHelper';

OS_IOS && TiFirebaseCore.configure();

const defaultUploadFolder = 'FOPsUpload';


const defaultMaxSize = 100000;

const firebaseStorage = (function () {

    const configureCore = () => {
        Alloy.Globals.doLog({
            text: 'configureCore()',
            program: logProgram
        });          
        OS_IOS && TiFirebaseCore.configure();
    };
    
    const upload = _parms => {
        Alloy.Globals.doLog({
            text: 'upload()',
            program: logProgram
        });   
        _parms = _parms || {};
        if (!_parms.data) {
            _parms.callback && _parms.callback({
                success: false,
                data: '"data" is a required parameter.'
            });            
            return;
        }
        const fullPath = `${defaultUploadFolder}/${_parms.name}`;

        const storageReference = FirebaseStorage.referenceForPath(fullPath);

        storageReference.upload({
            data: _parms.data,
            callback: event => {
                Alloy.Globals.doLog({
                    text: 'upload() result: ' + JSON.stringify(event),
                    program: logProgram
                });      
                if (!event.success) {
                    console.error('Could not upload: ', event.error);
                    _parms.callback && _parms.callback({
                        success: event.success,
                        data: event.error
                    });
                    return;
                }
                storageReference.downloadURL(_event => {
                    Alloy.Globals.doLog({
                        text: 'downloadURL() result: ' + JSON.stringify(_event),
                        program: logProgram
                    });      
                    event.publicUrl = _event.url;
                    _parms.callback && _parms.callback({
                        success: event.success,
                        data: event
                    });                        
                });
            }
        });        
    };

    const download = _parms => {
        Alloy.Globals.doLog({
            text: 'download()',
            program: logProgram
        });   
        _parms = _parms || {};
        _parms.maxSize = _parms.maxSize || defaultMaxSize;

        storageReference.download({
            maxSize: _parms.maxSize,
            callback: event => {

                Alloy.Globals.doLog({
                    text: 'download() result: ' + JSON.stringify(event),
                    program: logProgram
                });      
                if (!event.success) {
                    console.error('Could not download: ', event.error);
                    _parms.callback && _parms.callback({
                        success: event.success,
                        data: event.error
                    });
                    return;
                }
                _parms.callback && _parms.callback({
                    success: event.success,
                    data: event
                }); 
            }
        });
    };

    const getMetadata = _parms => {
        Alloy.Globals.doLog({
            text: 'getMetadata()',
            program: logProgram
        });   
        _parms = _parms || {};

        storageReference.getMetadata({
            callback: event => {
                Alloy.Globals.doLog({
                    text: 'getMetadata() result: ' + JSON.stringify(event),
                    program: logProgram
                });      
                if (!event.success) {
                    console.error('Could not get metadata: ', event.error);
                    _parms.callback && _parms.callback({
                        success: event.success,
                        data: event.error
                    });
                    return;
                }
                _parms.callback && _parms.callback({
                    success: event.success,
                    data: event
                }); 
            }
        });
    };


    const deleteMedia = _parms => {
        Alloy.Globals.doLog({
            text: 'deleteMedia()',
            program: logProgram
        });   
        _parms = _parms || {};

        storageReference.delete({
            callback: event => {

                Alloy.Globals.doLog({
                    text: 'deleteMedia() result: ' + JSON.stringify(event),
                    program: logProgram
                });      
                if (!event.success) {
                    console.error('Could not delete: ', event.error);
                    _parms.callback && _parms.callback({
                        success: event.success,
                        data: event.error
                    });
                    return;
                }
                _parms.callback && _parms.callback({
                    success: event.success,
                    data: event
                }); 
            }
        });
    };

    return {
        configureCore,
        upload,
        download,
        getMetadata,
        deleteMedia
    };
})();

module.exports = firebaseStorage;