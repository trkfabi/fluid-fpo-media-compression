import TiFirebaseCore from 'firebase.core';
import TiFirestore from 'firebase.firestore';

const moment = require('alloy/moment');
const logProgram = 'lib/helpers/firebaseFirestoreHelper';

const defaultCollectionName = 'FOPSMEDIA';

OS_IOS && TiFirebaseCore.configure();

var firestore = (function () {

    const configureCore = () => {
        Alloy.Globals.doLog({
            text: 'configureCore()',
            program: logProgram
        });          
        OS_IOS && TiFirebaseCore.configure();
    };
    
    const addDocument = _parms => {
        Alloy.Globals.doLog({
            text: 'addDocument()',
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
        _parms.collection = _parms.collection || defaultCollectionName;

        TiFirestore.addDocument({
            collection: _parms.collection,
            data: _parms.data,
            callback: event => {
                Alloy.Globals.doLog({
                    text: 'addDocument() result: ' + JSON.stringify(event),
                    program: logProgram
                });      
                if (!event.success) {
                    console.error('Could not save in Firestore: ', event.error);
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

    const updateDocument = _parms => {
        Alloy.Globals.doLog({
            text: 'updateDocument()',
            program: logProgram
        });   
        _parms = _parms || {};
        if (!_parms.data || !_parms.documentID) {
            _parms.callback && _parms.callback({
                success: false,
                data: '"data" and "documentID" are a required parameters.'
            });             
            return;
        }
        _parms.collection = _parms.collection || defaultCollectionName;

        TiFirestore.updateDocument({
            collection: _parms.collection,
            document: _parms.documentID,
            data: _parms.data,
            callback: event => {

                Alloy.Globals.doLog({
                    text: 'updateDocument() result: ' + JSON.stringify(event),
                    program: logProgram
                });      
                if (!event.success) {
                    console.error('Could not update in Firestore: ', event.error);
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

    const getDocuments = _parms => {
        Alloy.Globals.doLog({
            text: 'getDocuments()',
            program: logProgram
        });   
        _parms = _parms || {};
        _parms.collection = _parms.collection || defaultCollectionName;

        TiFirestore.getDocuments({
            collection: _parms.collection,
            callback: event => {


                Alloy.Globals.doLog({
                    text: 'getDocuments() result: ' + JSON.stringify(event),
                    program: logProgram
                });      
                if (!event.success) {
                    console.error('Could not read Firestore: ', event.error);
                    _parms.callback && _parms.callback({
                        success: event.success,
                        data: event.error
                    });
                    return;
                }
                console.warn('Received data from Firestore successfully: ');
                console.warn(JSON.stringify(event.documents, null, 4));                
                _parms.callback && _parms.callback({
                    success: event.success,
                    data: event
                }); 
            }
        });
    };


    const deleteDocument = _parms => {
        Alloy.Globals.doLog({
            text: 'deleteDocument()',
            program: logProgram
        });   
        _parms = _parms || {};
        if (!_parms.data || !_parms.documentID) {
            _parms.callback && _parms.callback({
                success: false,
                data: '"documentID" is a required parameter.'
            });             
            return;
        }
        _parms.collection = _parms.collection || defaultCollectionName;

        TiFirestore.deleteDocument({
            collection: _parms.collection,
            document: _parms.documentID,
            callback: event => {

                Alloy.Globals.doLog({
                    text: 'deleteDocument() result: ' + JSON.stringify(event),
                    program: logProgram
                });      
                if (!event.success) {
                    console.error('Could not delete in Firestore: ', event.error);
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
        addDocument,
        updateDocument,
        getDocuments,
        deleteDocument
    };
})();

module.exports = firestore;