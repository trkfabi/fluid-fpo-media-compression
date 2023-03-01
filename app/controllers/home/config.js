const alertDialogHelper = require("helpers/alertDialogHelper");
const helper = require('/helpers/helper');

const logProgram = 'home/config';
const args = $.args;

const configure = () => {
    Alloy.Globals.doLog({
        text: 'configure() quality: ' +Alloy.Globals.videoQuality + ' bitrate: '+Alloy.Globals.videoBitRate + ' FPS: ' + Alloy.Globals.videoFPS,
        program: logProgram
    });      
    $.bitrateRowInput.value = Alloy.Globals.videoBitRate / 1000;
    $.fpsRowInput.value = Alloy.Globals.videoFPS;
    let rowIndex = $.qualityRowPicker.columns[0].rows.findIndex(e => {
        console.warn(JSON.stringify(e));
        return e.customValue === Alloy.Globals.videoQuality;
    });
    $.qualityRowPicker.setSelectedRow(0, rowIndex);    
}

configure();

const onApplyClick = () => {
    Alloy.Globals.doLog({
        text: 'onApplyClick() quality: ' +$.qualityRowPicker.getSelectedRow(0).customValue + ' bitrate: '+$.bitrateRowInput.value * 1000+ ' fps: '+$.fpsRowInput.value,
        program: logProgram
    });     
    Ti.App.Properties.setInt(Alloy.Globals.videoQualityPropertyName, $.qualityRowPicker.getSelectedRow(0).customValue);
    Ti.App.Properties.setInt(Alloy.Globals.videoBitRatePropertyName, $.bitrateRowInput.value * 1000);
    Ti.App.Properties.setInt(Alloy.Globals.videoFPSPropertyName, $.fpsRowInput.value);
    Alloy.Globals.videoQuality = Ti.App.Properties.getInt(Alloy.Globals.videoQualityPropertyName, Ti.Media.QUALITY_IFRAME_1280x720);
    Alloy.Globals.videoBitRate = Ti.App.Properties.getInt(Alloy.Globals.videoBitRatePropertyName, 500000);  // in bits per second.  20 ~ 512kb (10 secs) ,  1250000 ~ 1.7mb (10 secs)    
    Alloy.Globals.fpsBitRate = Ti.App.Properties.getInt(Alloy.Globals.fpsPropertyName, 15); 
    onCloseLabelClick();
}
$.applyButton.addEventListener('click', onApplyClick);

const onCloseLabelClick = () => {
    args.onClose && args.onClose();
    $.win.close();
}
$.closeLabel.addEventListener('click', onCloseLabelClick);

// $.qualityRowPicker.addEventListener('postlayout', () => {
//     let rowIndex = $.qualityRowPicker.columns[0].rows.findIndex(e => {
//         console.warn(JSON.stringify(e));
//         return e.customValue === Alloy.Globals.videoQuality;
//     });
//     $.qualityRowPicker.setSelectedRow(0, rowIndex);
// });

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
