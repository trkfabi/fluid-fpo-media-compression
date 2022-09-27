// const moment = require('alloy/moment');

// var overlayView = Ti.UI.createView({
// 	left: 0,
// 	top: 0,
// 	right: 0,
// 	bottom: 0,
// 	zIndex: 10
// });
// var overlayMessage = Ti.UI.createLabel({
// 	left: 20,
// 	right: 20,
// 	height: 60,
// 	backgroundColor: '#000',
// 	borderRadius: 10,
// 	color:'#FFF',
// 	textAlign: 'center'
// });
// overlayView.add(overlayMessage);

// var allowTranscoding = true;
// var videoQuality = Ti.Media.QUALITY_MEDIUM;
// if (OS_IOS) {
// 	allowTranscoding = false;
// }
// function doClick(e) {
// 	Ti.Media.openPhotoGallery({
// 		allowEditing: true,
// 		autohide: true,
// 		allowMultiple: false,
// 		mediaTypes: [Titanium.Media.MEDIA_TYPE_VIDEO, Titanium.Media.MEDIA_TYPE_PHOTO],
// 		allowTranscoding: allowTranscoding,	// if this is false, videoQuality does not matter (full quality)
// 		videoQuality: videoQuality,
// 		success: _e => {
// 			$.win.add(overlayView);
// 			overlayMessage.text = 'Processing file...';
// 			console.log('Processing file...');
// 			console.warn(JSON.stringify(_e));
// 			if (_e.success) {
// 				if(_e.mediaType === 'public.movie') {
// 					var filename = 'movie_' + moment().format('YYYYMMDDhhmmss') + '.mov';
// 					var outputFile  = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
// 					if (!outputFile.write(_e.media)) {
// 						// handle write error
// 						console.error('could not write');
// 					}
					
// 					if(OS_IOS) {
// 						Ti.Media.exportVideo({
// 							url: outputFile.nativePath,
// 							quality: "medium"
// 						});
// 						Ti.Media.addEventListener('exportvideo:completed', _e=>{
// 							console.warn(JSON.stringify(_e));
// 							console.warn('should upload ' + _e.url);

// 							doUploadFile({
// 								url: _e.url
// 							});
// 						});
// 					} else {
// 						doUploadFile({
// 							url: outputFile.nativePath
// 						});
// 					}
// 					outputFile = null;
// 				} else {
// 					// picture
// 				}
// 			}

// 		}
// 	});
// }

// function doUploadFile(_parms) {
// 	console.log('Uploading file...');
// 	overlayMessage.text = 'Uploading file...';
// 	var uploadFile  = Ti.Filesystem.getFile(_parms.url);
// 	if (uploadFile.exists()){ 
// 		console.log('upload file size: '+uploadFile.size/1024/1024 + ' Mb');
// 	}

// 	setTimeout(function(){
// 		overlayMessage.text = 'Completed!';
// 		setTimeout(function(){
// 			$.win.remove(overlayView);
// 			//Ti.Media.hideCamera();
// 		},2000);
// 	}, 4000);
// }
// $.win.open();


require('/application').start();