/**
 * Utility functions that generate alert dialogs
 * @version 1.0.0
 * @class helpers/alertDialogHelper
 */

var alertDialogHelper = (function () {

	var defaultTitle = '';
	var defaultButton = L('common_alert_ok', 'OK');
	var defaultCancelButton = L('common_alert_cancel', 'Cancel');

	/*
	 * @method configDefaultTitle
	 * Configures the default title for all the alerts created on this device
	 * @param {String} _title New title
	 * @return {void}
	 */
	function configDefaultTitle(_title) {
		defaultTitle = _title || '';
	}

	function createTemporalMessage(_params) {
		_params = _params || {};
		_params.message = _params.message || '';
		_params.backgroundColor = _params.backgroundColor || '#CCCCCC';
		_params.color = _params.color || '#000000';
		_params.duration = _params.duration || 3000;
		_params.font = _params.font || {
			fontSize: 16
		};
		_params.opacity = _params.opacity || 1;

		var view = Ti.UI.createView({
			height: Ti.UI.SIZE,
			left: 50,
			right: 50,
			backgroundColor: _params.backgroundColor,
			borderRadius: 10,
			layout: 'vertical'	,
			opacity: _params.opacity		
		});
		var separatorTop = Ti.UI.createView({
			top: 0,
			height: 30,
			width: Ti.UI.FILL
		});
		var separatorBottom = Ti.UI.createView({
			top: 0,
			height: 30,
			width: Ti.UI.FILL
		});		
		var label = Ti.UI.createLabel({
			top: 0,
			text: _params.message,
			height: Ti.UI.SIZE,			
			left: 10, 
			right: 10,
			color: _params.color,
			font: _params.font,
			textAlign: 'center'
		});
		if (_params.hasOwnProperty('top')) {
			view.top = _params.top;
		} else if (_params.hasOwnProperty('bottom')) {
			view.bottom = _params.bottom;
		}
		var win = Ti.UI.createWindow({
			backgroundColor: 'transparent'
		});
		view.add(separatorTop);
		view.add(label);
		view.add(separatorBottom);
		win.add(view);
		win.open();

		setTimeout(win.close, _params.duration);
	}
	/*
	 * @method createAlertDialog
	 * Creates an alert dialog
	 * @param {Object} _params
	 * @param {String} _params.title
	 * @param {String} _params.message
	 * @param {Array} _params.buttonNames
	 * @param {Boolean} _params.forceAction
	 * @param {Boolean} _params.persistent
	 * @param {Function} _params.clickCallback
	 * @return {Ti.UI.AlertDialog}
	 */
	function createAlertDialog(_params) {
		_params = _params || {};
		_params.title = _params.title || defaultTitle;
		_params.message = _params.message || '';
		_params.buttonNames = _params.buttonNames || [defaultButton];
		_params.forceAction = _params.forceAction || false;
		_params.persistent = _params.persistent || (OS_IOS ? false : true);

		var alertDialog = Ti.UI.createAlertDialog({
			title: _params.title,
			message: _params.message,
			buttonNames: _params.buttonNames,
			persistent: _params.persistent
		});

		if (OS_ANDROID && _params.forceAction) {
			alertDialog.applyProperties({
				buttonClickRequired: true,
				canceledOnTouchOutside: false
			});
		}

		_params.clickCallback && alertDialog.addEventListener('click', _params.clickCallback);

		return alertDialog;
	}

	/*
	 * @method createConfirmDialog
	 * Creates a confirm dialog
	 * @param {Object} _params
	 * @param {String} _params.title
	 * @param {String} _params.message
	 * @return {Ti.UI.AlertDialog}
	 */
	function createConfirmDialog(_params) {
		_params.buttonNames = _params.buttonNames || [defaultButton, defaultCancelButton];
		var alertDialog = createAlertDialog(_params);

		alertDialog.addEventListener('click', function (_evt) {
			if (_evt.index == 1) {
				_params.cancelActionCallback && _params.cancelActionCallback(_evt);
			}
			if (_evt.index == 0) {
				_params.confirmActionCallback && _params.confirmActionCallback(_evt);
			}
		});

		return alertDialog;
	}

	/*
	 * @method createOptionDialog
	 * Creates an option dialog
	 * @param {Object} _params
	 * @param {String} _params.title
	 * @param {String} _params.persistent
	 * @param {String} _params.cancel
	 * @param {Array} _params.options
	 * @return {Ti.UI.OptionDialog}
	 */
	function createOptionDialog(_params) {

		_params.title = _params.title || 'Options';
		_params.cancel = _params.cancel || _params.options.length - 1;
		_params.selectedIndex = _params.selectedIndex || _params.cancel;
		_params.persistent = _params.persistent || (OS_IOS ? false : true);

		var alertDialog = Ti.UI.createOptionDialog(_params);

		alertDialog.addEventListener('click', function (_evt) {
			if (_evt.index === _params.cancel) {
				_params.cancelActionCallback && _params.cancelActionCallback(_evt);
			} else {
				_params.confirmActionCallback && _params.confirmActionCallback(_evt);
			}
		});

		return alertDialog;
	}

	return {
		configDefaultTitle: configDefaultTitle,

		createAlertDialog: createAlertDialog,
		createConfirmDialog: createConfirmDialog,
		createOptionDialog: createOptionDialog,

		createTemporalMessage: createTemporalMessage
	};
})();

module.exports = alertDialogHelper;
