const alertDialogHelper = require("helpers/alertDialogHelper");

const logProgram = 'home/activityHistory';
const args = $.args;

let activity = Alloy.Globals.activityHistory;

const configure = () => {
    var dataSet = [];
    activity.forEach( (item, index) => {
        dataSet.push({
            template: "template",
            urlToCopy: item.url,
            properties: {
                height: 70,
                selectionStyle: 0
            },
            picture: {
                image: item.type === 'photo' ? item.url: (item.videothumbnail || null)
            },
            timestamp: {
                text: item.date
            },
            size: {
                text: item.size || ''
            },            
            status: {
                image: item.status === 'success' ? '/images/success.png': '/images/error.png'
            },
            url: {
                text: item.status === 'success' ? 'Click to copy the URL': ''
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
            activity = [];
            Ti.App.Properties.setList(Alloy.Globals.activityHistoryPropertyName, activity);
            Alloy.Globals.activityHistory = activity;   
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
    let url = $.listView.sections[_e.sectionIndex].getItemAt(_e.itemIndex).urlToCopy;
    Ti.UI.Clipboard.clearText();
    Ti.UI.Clipboard.setText(url);    
    alertDialogHelper.createTemporalMessage({
        message: 'Copied to clipboard',
        duration: 2000,
        opacity: 0.8,
        font: {
            fontSize: 20
        }
    });
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