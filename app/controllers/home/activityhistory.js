const logProgram = 'home/activityHistory';
const args = $.args;

let activity = Alloy.Globals.activityHistory;
console.warn('activity: ' + JSON.stringify(activity));

const configure = () => {
    let rows = [];
    activity.forEach( (item, index) => {
        let rowController = Alloy.createController('partials/activityHistoryRow', {
            item: item,
            index: index
        });

        let row = rowController.getView();
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