/**
 * Network functions that monitor network connectivity
 * @version 1.0.0
 * @class helpers/networkHelper
 */
const dispatcher = require('dispatcher');

const logProgram = 'lib/helpers/networkHelper';
const logColor = 'blue';
const logType = 'info';

const networkHelper = (function () {

	let connectionBar;
	let slowConnectionTimeout = null;
	let abortConnectionTimeout = null;
	const defaultSlowConnectionTime = 14000;
	const abortWaitTime = 6000;
	let connectionPopUp = null,
		lastConnectionPopUpParent = null,
		connectionPopUpTimer = null;
	let requestTracker = [];

	const closeConnectionBar = () => {
		connectionBar && connectionBar.animate(
			Ti.UI.createAnimation({
				bottom: -55,
				duration: 200,
			}),
			() => {
				connectionBar && Alloy.Globals.windowStack.currentWindow.remove(connectionBar);
				connectionBar = null;
			}
		);
	};

	const createConnectionBar = (title, titleColor, description) => {
		if (Alloy.Globals.windowStack.currentWindow && !connectionBar) {
			connectionBar = Ti.UI.createView({
				backgroundColor: "white",
				height: 56,
				borderColor: Alloy.CFG.colors.newGrey1,
				borderWidth: 1,
				left: -1,
				right: -1,
				bottom: -55,
				zIndex: 100000,
			});

			connectionBar.addEventListener("click", function (e) {
				closeConnectionBar();
			});

			connectionBar.add(
				Ti.UI.createLabel({
					font: Alloy.CFG.fonts.bold17,
					left: 20,
					right: 20,
					top: 8,
					textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
					color: titleColor,
					text: title,
					touchEnabled: false,
				})
			);

			connectionBar.add(
				Ti.UI.createLabel({
					font: Alloy.CFG.fonts.regular14,
					left: 20,
					right: 20,
					bottom: 8,
					textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
					color: Alloy.CFG.colors.textDark,
					text: description,
					touchEnabled: false,
				})
			);

			//Extra check to prevent crashes
			if (Alloy.Globals.windowStack.currentWindow && connectionBar) {
				Alloy.Globals.windowStack.currentWindow.add(connectionBar);

				connectionBar.animate(
					Ti.UI.createAnimation({
						bottom: 0,
						duration: 200,
					})
				);
			}
		}
	};

	const onNetworkChange = e => {
		Alloy.Globals.doLog({
			type: logType,
			text: `onNetworkChange() online: ${e.online}`,
			program: logProgram,
			color: logColor
		});
		if (!e.online) {
			createConnectionBar("No Connection...", Alloy.CFG.colors.red,
				"Make sure your data and/or WIFI is enabled.");
			return;
		}
		closeConnectionBar();
	};
	const onSlowConnection = e => {
		Alloy.Globals.doLog({
			type: logType,
			text: 'onSlowConnection()',
			program: logProgram,
			color: logColor
		});
		createConnectionBar("Slow Connection...", Alloy.CFG.colors.yellow,
			"Check your WIFI or data connection");
	};
	const onGoodConnection = e => {
		closeConnectionBar();
	};

	const createSlowConnectionTimeout = (_timeout, _onSlowConnection) => {
		_timeout = _timeout || defaultSlowConnectionTime;
		slowConnectionTimeout && clearTimeout(slowConnectionTimeout);
		abortConnectionTimeout && clearTimeout(abortConnectionTimeout);
		slowConnectionTimeout = setTimeout(() => {
				dispatcher.trigger("fluid:slowConnection");

				_onSlowConnection && (abortConnectionTimeout = setTimeout(function () {
					_onSlowConnection();
				}, abortWaitTime));
			},
			_timeout);
	};

	const destroySlowConnectionTimeout = () => {
		slowConnectionTimeout && clearTimeout(slowConnectionTimeout);
		slowConnectionTimeout = null;
		abortConnectionTimeout && clearTimeout(abortConnectionTimeout);
		abortConnectionTimeout = null;
		dispatcher.trigger('fluid:goodConnection');
	};

	const createGlobalListeners = () => {
		Alloy.Globals.doLog({
			type: logType,
			text: `createGlobalListeners()`,
			program: logProgram,
			color: logColor
		});

		Ti.Network.addEventListener("change", onNetworkChange);
		dispatcher.on("fluid:slowConnection", onSlowConnection);
		dispatcher.on("fluid:goodConnection", onGoodConnection);
	};

	const showConnectionPopUp = (_args) => {
		if (!connectionPopUp) {
			lastConnectionPopUpParent = _args.parentView;
			connectionPopUp = Alloy.createWidget("popUp.activityScreen", "widget", {
				message: _args.message || '',
				displayAnimation: _args.displayAnimation || false
			}).getView();
			connectionPopUp.visible = true;
			lastConnectionPopUpParent.add(connectionPopUp);

			if (_args.timeout) {
				connectionPopUpTimer = setTimeout(hideConnectionPopUp, _args.timeout);
			}
		}
	};
	Alloy.Globals.showConnectionPopUp = showConnectionPopUp;

	const hideConnectionPopUp = () => {
		if (connectionPopUp && lastConnectionPopUpParent) {
			connectionPopUp.animate({
				opacity: 0,
				duration: 100
			}, function(){
				try {
					lastConnectionPopUpParent.remove(connectionPopUp);
					connectionPopUp = null;
					lastConnectionPopUpParent = null;
					connectionPopUpTimer && clearTimeout(connectionPopUpTimer);
					connectionPopUpTimer = null;
				} catch(e) {
					
				}
			});
		}
	};
	Alloy.Globals.hideConnectionPopUp = hideConnectionPopUp;

	const updateInternetSpeed = _parms => {
		switch (_parms.type) {
		case 'REQUEST':
			requestTracker.push({
				id: _parms.id,
				start: new Date().getTime()
			});
			break;
		case 'RESPONSE':
		case 'ERROR':
			processRequest(_parms);
			break;
		}
	};

	function processRequest(_parms) {
		let itemIndex = null;
		let request;
		request = requestTracker.find(function (x, index) {
			if (x.id == _parms.id) {
				itemIndex = index;
				return true;
			}
			return false;
		});
		if (request) {
			let now = new Date().getTime();
			let difference = now - request.start;
			//console.warn('networkHelper - updateInternetSpeed difference: ' + difference + ' for method: ' + _parms.method);
			requestTracker.splice(itemIndex, 1);
		}
	};
	return {
		createGlobalListeners,
		createSlowConnectionTimeout,
		destroySlowConnectionTimeout,
		showConnectionPopUp,
		hideConnectionPopUp,
		updateInternetSpeed

	};
})();

module.exports = networkHelper;
