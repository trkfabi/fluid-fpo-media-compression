const alertDialogHelper = require("helpers/alertDialogHelper");
const helper = require('/helpers/helper');

const logProgram = 'home/activityHistory';
const args = $.args;

let activity = Alloy.Globals.activityHistory;

const configure = () => {
    // list files in appDir
    helper.listDirectories();

    var dataSet = [];
    activity.forEach( (item, index) => {
        
        dataSet.push({
            template: "template",
            itemUrl: item.url,
            itemStatus: item.status,
            itemType: item.type,
            itemName: item.name,
            properties: {
                height: 70,
                selectionStyle: 0
            },
            bindItemPicture: {
                image: item.status === 'success' && item.type == 'photo' ? item.url: item.thumbnail,
            },
            bindItemTimestamp: {
                text: item.date
            },
            bindItemSize: {
                text: item.size || ''
            },            
            bindItemStatus: {
                image: item.status === 'success' ? '/images/success.png': '/images/error.png'
            },
            bindItemUrl: {
                text: item.status === 'success' ? 'Click to copy the URL': 'Retry upload'
            }
            
        });
    });
    let section = Ti.UI.createListSection();
	$.listView.sections = [section];
    section.items = dataSet.reverse();
}

configure();

const onClearHistoryClick = () => {
    alertDialogHelper.createConfirmDialog({
        title: 'Clear activity?',
        message: `This can't be undone.`,
        cancelActionCallback: () => {},
        confirmActionCallback: () => {
            activity.forEach( (item, index) => {
                var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, item.name);
                if ( file.exists() ) {
                    file.deleteFile();
                }
            });
            activity = [];
            Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
            Alloy.Globals.activityHistory = activity;   

            helper.emptyDirectories();
            
            configure();           
        }
    }).show();
}
$.clearLabel.addEventListener('click', onClearHistoryClick);

const onCloseLabelClick = () => {
    args.onClose && args.onClose();
    $.win.close();
}
$.closeLabel.addEventListener('click', onCloseLabelClick);

const onListClick = (_e) => {
    let url = $.listView.sections[_e.sectionIndex].getItemAt(_e.itemIndex).itemUrl;
    let type = $.listView.sections[_e.sectionIndex].getItemAt(_e.itemIndex).itemType;
    let name = $.listView.sections[_e.sectionIndex].getItemAt(_e.itemIndex).itemName;
    if ($.listView.sections[_e.sectionIndex].getItemAt(_e.itemIndex).itemStatus === 'success') {
        Ti.UI.Clipboard.clearText();
        Ti.UI.Clipboard.setText(url);    
        alertDialogHelper.createTemporalMessage({
            message: 'URL copied to clipboard',
            duration: 2000,
            opacity: 0.8,
            font: {
                fontSize: 20
            }
        });
    } else {
        // alertDialogHelper.createConfirmDialog({
        //     title: 'Retry upload?',
        //     message: `This will try to upload the file.`,
        //     cancelActionCallback: () => {},
        //     confirmActionCallback: () => {
        //         var messageDialog = alertDialogHelper.createTemporalMessage({
        //             message: 'Uploading...',
        //             duration: 0,
        //             opacity: 0.8,
        //             font: {
        //                 fontSize: 20
        //             }
        //         });          
        //         helper.uploadFile({
        //             file: {
        //                 name,
        //                 url,
        //                 type
        //             },
        //             onSuccess: _response => {
        //                 messageDialog.close();
        //                 let newActivityItem = _response.item;
        //                 activity.push(newActivityItem);
        //                 Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
        //                 Alloy.Globals.activityHistory = activity;
            
        //                 Ti.UI.Clipboard.clearText();
        //                 Ti.UI.Clipboard.setText(newActivityItem.url);   
        //                 configure();
        //                 alertDialogHelper.createTemporalMessage({
        //                     message: 'URL(s) copied to clipboard',
        //                     duration: 2000,
        //                     opacity: 0.8,
        //                     font: {
        //                         fontSize: 20
        //                     }
        //                 });                             
        //             },
        //             onError: _response => {
        //                 messageDialog.close();
        //                 let newActivityItem = _response.item;
        //                 Ti.UI.Clipboard.clearText();
        //                 activity.push(newActivityItem);
        //                 Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
        //                 Alloy.Globals.activityHistory = activity;
        //                 configure();
        //                 alertDialogHelper.createTemporalMessage({
        //                     message: 'File could not be uploaded.',// Error: ' + _response.error.messages[0],
        //                     duration: 2000,
        //                     opacity: 0.8,
        //                     color: 'red',
        //                     font: {
        //                         fontSize: 20
        //                     }
        //                 });                 
        //             }
        //         });      
        //     }
        // }).show();        
    }
}

$.listView.addEventListener('itemclick', onListClick);

$.win.addEventListener('open', ()=>{
    args.openControllers && args.openControllers.push($);
    Alloy.Globals.doLog({
        text: 'openControllers: ' +args.openControllers.length,
        program: logProgram
    });        
});

$.win.addEventListener('close', ()=>{
    args.openControllers && args.openControllers.pop($);
    Alloy.Globals.doLog({
        text: 'openControllers: ' + args.openControllers.length,
        program: logProgram
    });        
});