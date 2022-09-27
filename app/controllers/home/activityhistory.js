const logProgram = 'home/activityHistory';
const args = $.args;

let activity = Alloy.Globals.activityHistory;
console.warn('activity: ' + JSON.stringify(activity));

const configure = () => {
    let rows = [];
    activity.forEach( (item, index) => {
        console.warn(item);
        let row = Ti.UI.createTableViewRow({
            className: 'row'
        });
        let rowView = Ti.UI.createView({
            height: 50,
            width: Ti.UI.FILL
        });
        let sampleLabel = Ti.UI.createLabel({
            text: `${item.date} | ${item.type} | ${item.status} | ${item.url}`,
            color: '#000000',
            textAlign: 'left',
            left: 20,
            right: 20,
            height: Ti.UI.SIZE
        });
        rowView.add(sampleLabel);
        row.add(rowView);
        rows.push(row);
    });
    $.activityTableview.data = rows;
}

configure();

const onCloseLabelClick = () => {
    $.win.close();
}
$.closeLabel.addEventListener('click', onCloseLabelClick);

const onTableClick = (_e) => {
    console.warn(JSON.stringify(_e));
    alert('URL copied to clipboard');
}

$.activityTableview.addEventListener('click', onTableClick);

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