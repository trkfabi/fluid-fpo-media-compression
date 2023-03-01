// SUPPORT VIDEO OR NOT
Alloy.Globals.allowVideoFiles = true;

/*
To use Leo's app (without uploading) set:
 - allowMulitpleFiles = false;
 - onlySaveToGallery = true;

To use the app with multiple select and uploading set:
 - allowMulitpleFiles = true;
 - onlySaveToGallery = false;
*/

// CONFIGURATION OPTIONS ///////////////////////////////
Alloy.Globals.allowMulitpleFiles = false;
Alloy.Globals.onlySaveToGallery = true;
////////////////////////////////////////////////////////

Alloy.Globals.videoQualityPropertyName = 'fops:videoquality';
Alloy.Globals.videoBitRatePropertyName = 'fops:videobitrate';
Alloy.Globals.videoFPSPropertyName = 'fops:videofps';

// CUSTOMIZATION
Alloy.Globals.defaultUploadFolder = 'fopsupload';
Alloy.Globals.photoDesiredSize = 640;

// console.warn('qualities:');
// console.warn('Ti.Media.QUALITY_HIGH: '+ Ti.Media.QUALITY_HIGH);
// console.warn('Ti.Media.QUALITY_640x480: '+ Ti.Media.QUALITY_640x480);
// console.warn('Ti.Media.QUALITY_IFRAME_960x540: '+ Ti.Media.QUALITY_IFRAME_960x540);
// console.warn('Ti.Media.QUALITY_IFRAME_1280x720: '+ Ti.Media.QUALITY_IFRAME_1280x720);
// console.warn(JSON.stringify(Ti.Media.getSupportedFormats()));

Alloy.Globals.videoQuality = Ti.App.Properties.getInt(Alloy.Globals.videoQualityPropertyName, Ti.Media.QUALITY_IFRAME_1280x720);
Alloy.Globals.videoBitRate = Ti.App.Properties.getInt(Alloy.Globals.videoBitRatePropertyName, 500000);  // in bits per second.  20 ~ 512kb (10 secs) ,  1250000 ~ 1.7mb (10 secs)
Alloy.Globals.videoFPS = Ti.App.Properties.getInt(Alloy.Globals.videoFPSPropertyName, 30);
////////////////////////////////////////////////////////

// GENERIC STUFF

Alloy.Globals.isInSandboxMode = true;

Alloy.Globals.authorizationTokenV2 = '';
Alloy.Globals.refreshTokenV2 = '';

Alloy.Globals.deviceHeight = OS_IOS ? Ti.Platform.displayCaps.platformHeight : (Ti.Platform.displayCaps.platformHeight /
	Ti.Platform.displayCaps.logicalDensityFactor);
Alloy.Globals.deviceWidth = OS_IOS ? Ti.Platform.displayCaps.platformWidth : (Ti.Platform.displayCaps.platformWidth /
	Ti.Platform.displayCaps.logicalDensityFactor);
Alloy.Globals.hasNotch = hasDeviceNotch();

Alloy.Globals.statusBarHeight = OS_IOS ? (Alloy.Globals.hasNotch ? 44 : 20) : 10;
Alloy.Globals.navBarHeight = OS_IOS ? Alloy.Globals.statusBarHeight + 44 : 50;
Alloy.Globals.bottomBarHeight = Alloy.Globals.hasNotch ? 34 : 0;

const consoleColors = require('helpers/consoleColorsHelper').colors;
Alloy.Globals.doLog = _params => {
    const {
        type = 'info',
            program = '',
            text = '',
            color = 'white'
    } = _params;

    const LOG_TAG = consoleColors[color] + '[' + program + ']' + consoleColors.end;

    type === 'error' && console.error(LOG_TAG, text);
    type === 'warn' && console.warn(LOG_TAG, text);
    type === 'info' && console.log(LOG_TAG, text);
    type === 'debug' && console.debug(LOG_TAG, text);
    type === 'trace' && console.trace(LOG_TAG, text);
};    


/**
 * @method hasDeviceNotch
 * Returns a boolean flag that indicates if the device running this application does have a notch.
 * @return {Boolean}
 */
 function hasDeviceNotch() {
	if (!OS_IOS) {
		return false;
	}

    if ( 
        // iPhone X / Xs / 11 pro / 12 mini / 13 mini
        Ti.Platform.displayCaps.platformWidth === 375 && 
        Ti.Platform.displayCaps.platformHeight === 812 && 
        (Ti.Platform.displayCaps.logicalDensityFactor === 3 || Ti.Platform.displayCaps.logicalDensityFactor === 2)) {
        return true;
    }
    if ( 
        // iPhone XR / XS max / 11 / 11 pro max
        Ti.Platform.displayCaps.platformWidth === 414 && 
        Ti.Platform.displayCaps.platformHeight === 896 && 
        ( Ti.Platform.displayCaps.logicalDensityFactor === 2 || Ti.Platform.displayCaps.logicalDensityFactor === 3) ) {
        return true;
    }

    if (
        // iPhone 12 / 12 Pro / 13 / 13 pro / 14
        Ti.Platform.displayCaps.platformWidth === 390 &&
        Ti.Platform.displayCaps.platformHeight === 844 &&
        (Ti.Platform.displayCaps.logicalDensityFactor === 2 || Ti.Platform.displayCaps.logicalDensityFactor === 3)) {
        return true;
    }

	if (
        // iPhone 14 pro
        Ti.Platform.displayCaps.platformWidth === 393 &&
        Ti.Platform.displayCaps.platformHeight === 852 &&
        Ti.Platform.displayCaps.logicalDensityFactor === 3) {
        return true;
    }

    if (
        // iPhone 12 Pro max / 13 pro max / 14 plus
        Ti.Platform.displayCaps.platformWidth === 428 &&
        Ti.Platform.displayCaps.platformHeight === 926 &&
        Ti.Platform.displayCaps.logicalDensityFactor === 3) {
        return true;
    }	

	if (
        // iPhone 14 Pro max /
        Ti.Platform.displayCaps.platformWidth === 430 &&
        Ti.Platform.displayCaps.platformHeight === 932 &&
        Ti.Platform.displayCaps.logicalDensityFactor === 3) {
        return true;
    }	
	return false;
}

Alloy.Globals.activityHistoryPropertyName = 'fpo:mediacompression_history'
Alloy.Globals.activityHistory = Ti.App.Properties.hasProperty(Alloy.Globals.activityHistoryPropertyName) ? 
                                Ti.App.Properties.getList(Alloy.Globals.activityHistoryPropertyName) :
                                [];

Alloy.Globals.doLog({
	type: 'info',
	text: 'pH: ' + Ti.Platform.displayCaps.platformHeight + ' pW: '+Ti.Platform.displayCaps.platformWidth+ ' df: '+Ti.Platform.displayCaps.logicalDensityFactor+' hasNotch: '+Alloy.Globals.hasNotch,
	program: 'alloy'
});
