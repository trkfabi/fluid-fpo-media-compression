const logProgram = 'lib/helpers/hapticFeedbackHelper';
const logColor = 'white';

const impact = style => {
	let pattern;
	switch (style) {
	case "light":
		OS_ANDROID && (pattern = [0, 100]);
		OS_IOS && (pattern = Ti.UI.iOS.createFeedbackGenerator({
			type: Ti.UI.iOS.FEEDBACK_GENERATOR_TYPE_IMPACT,
			style: Ti.UI.iOS.FEEDBACK_GENERATOR_IMPACT_STYLE_LIGHT
		}));
		break;
	case "medium":
		OS_ANDROID && (pattern = [0, 300]);
		OS_IOS && (pattern = Ti.UI.iOS.createFeedbackGenerator({
			type: Ti.UI.iOS.FEEDBACK_GENERATOR_TYPE_IMPACT,
			style: Ti.UI.iOS.FEEDBACK_GENERATOR_IMPACT_STYLE_MEDIUM
		}));
		break;
	case "heavy":
		OS_ANDROID && (pattern = [0, 500]);
		OS_IOS && (pattern = Ti.UI.iOS.createFeedbackGenerator({
			type: Ti.UI.iOS.FEEDBACK_GENERATOR_TYPE_IMPACT,
			style: Ti.UI.iOS.FEEDBACK_GENERATOR_IMPACT_STYLE_HEAVY
		}));
		break;
	default:
		OS_ANDROID && (pattern = [0, 100]);
		OS_IOS && (pattern = Ti.UI.iOS.createFeedbackGenerator({
			type: Ti.UI.iOS.FEEDBACK_GENERATOR_TYPE_IMPACT,
			style: Ti.UI.iOS.FEEDBACK_GENERATOR_IMPACT_STYLE_MEDIUM
		}));
	}
	OS_ANDROID && Ti.Media.vibrate(pattern);
	OS_IOS && pattern.impactOccurred();
};

const select = () => {
	if (OS_IOS) {
		const selectionFeedback = Ti.UI.iOS.createFeedbackGenerator({
			type: Ti.UI.iOS.FEEDBACK_GENERATOR_TYPE_SELECTION
		});
		selectionFeedback.selectionChanged();
	} else {
		impact("light");
	}
};

const notify = type => {
	if (OS_IOS) {
		const notificationFeedback = Ti.UI.iOS.createFeedbackGenerator({
			type: Ti.UI.iOS.FEEDBACK_GENERATOR_TYPE_NOTIFICATION
		});
		let notificationType = Ti.UI.iOS.FEEDBACK_GENERATOR_NOTIFICATION_TYPE_SUCCESS;
		switch (type) {
		case "warning":
			notificationType = Ti.UI.iOS.FEEDBACK_GENERATOR_NOTIFICATION_TYPE_WARNING;
			break;
		case "error":
			notificationType = Ti.UI.iOS.FEEDBACK_GENERATOR_NOTIFICATION_TYPE_ERROR;
			break;
		}

		notificationFeedback.notificationOccurred(notificationType);
	} else {
		let pattern = [0, 100];
		switch (type) {
		case "warning":
			pattern = [0, 100, 200, 100]; // delay=0, first vibration, delay, second vibration
			break;
		case "error":
			pattern = [0, 500]; // delay=0, long vibration
			break;
		}
		Ti.Media.vibrate(pattern);
	}
};

exports.notify = notify;
exports.select = select;
exports.impact = impact;
