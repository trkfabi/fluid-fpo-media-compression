
const logProgram = 'lib/appNavigation';
const logColor = 'blue';
const logType = 'info';

/**
 * Navigation Module
 * Singleton mediator for handling app navigation.
 * @class Lib.AppNavigation
 * @singleton
 */
const appNavigation = (function () {
    let openControllers = [];

	const openHome = _parms => {
        _parms = _parms || {};
		Alloy.Globals.doLog({
			type: logType,
			text: 'openHome()',
			program: logProgram,
			color: logColor
		});
        _parms.openControllers = openControllers;
        let controller = Alloy.createController("home/cameraScreen", _parms);
        
        controller.getView().open();
	};
	const openPostProcess = _parms => {
        _parms = _parms || {};
		Alloy.Globals.doLog({
			type: logType,
			text: 'openPostProcess()',
			program: logProgram,
			color: logColor
		});
        _parms.openControllers = openControllers;
        let controller = Alloy.createController("home/postProcess", _parms);
        
        controller.getView().open();
	};

	const openActivity = _parms => {
        _parms = _parms || {};
		Alloy.Globals.doLog({
			type: logType,
			text: 'openActivity()',
			program: logProgram,
			color: logColor
		});
        _parms.openControllers = openControllers;
        let controller = Alloy.createController("home/activityHistory", _parms);
        
        controller.getView().open();		
	}
	// Public API.
	return {
		openHome,
		openPostProcess,
		openActivity
	};
})();

module.exports = appNavigation;
