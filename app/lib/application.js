const appNavigation = require('appNavigation');
const logProgram = 'lib/application';
const logColor = 'blue';
const logType = 'info';

const application = (function () {
	const onUncaughtException = (e) => {
		let lineSource;
		if (OS_IOS) {
			lineSource = e.stack ? e.stack : e.nativeStack ? e.nativeStack : "";
		} else {
			lineSource = e.lineSource;
		}
		if (lineSource === null) lineSource = "";
		lineSource = lineSource.length > 150 ? lineSource.substring(0, 150) : lineSource;
		const errorData = {
			line: e.line,
			lineOffset: OS_IOS ? e.column : e.lineOffset,
			message: e.message,
			sourceName: OS_IOS ? e.sourceURL : e.sourceName,
			lineSource: lineSource,
		};
		Alloy.Globals.doLog({
			type: 'error',
			text: `onUncaughtException() data: ${JSON.stringify(errorData)}`,
			program: logProgram,
			color: logColor
		});
	};

	const onMemoryWarning = _e => {
		console.warn(JSON.stringify(_e));
	};
	
	const start = () => {
		Alloy.Globals.doLog({
			type: logType,
			text: 'start()',
			program: logProgram,
			color: logColor
		});
		if (Ti.App.Properties.getBool('app:isFirstLaunch', true)) {
			Alloy.Globals.doLog({
				type: logType,
				text: 'First launch clear directories()',
				program: logProgram,
				color: logColor
			});			
			require('/helpers/helper').emptyDirectories();
			Ti.App.Properties.setBool('app:isFirstLaunch', false)
		}
        appNavigation.openHome();

		// OS_ANDROID && Ti.App.addEventListener("paused", onPaused);
		// OS_IOS && Ti.App.addEventListener("pause", onPaused);
		// Ti.App.addEventListener("resume", onResume);
		// Ti.App.addEventListener("close", onClose);
		Ti.App.addEventListener("memorywarning", onMemoryWarning);
		Ti.App.addEventListener("uncaughtException", onUncaughtException);
	};

	// Public API.
	return {
		start: start
	};
})();

module.exports = application;    