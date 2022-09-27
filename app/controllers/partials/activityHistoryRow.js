const args = $.args;
const logProgram = 'partials/activityHistoryRow';

const configure = () => {
    const data = args.item;
    const rowIndex = args.index;

    $.imageRow.image = data.url;
    $.timestampRow.text = data.date;
    $.statusRow.text = data.status === 'success' ? 'Successfully uploaded': 'Upload error';  
    $.statusRow.color = data.status === 'success' ? $.statusRow.successColor : $.statusRow.errorColor;
    $.urlRow.text = data.url;
}

configure();