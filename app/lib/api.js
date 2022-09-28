/**
 * @class lib.api
 * API Wrapper
 * @uses helpers/alertDialogHelper
 * @uses helpers/networkHelper
 */
 const alertDialogHelper = require('helpers/alertDialogHelper');
 const networkHelper = require('helpers/networkHelper');
 const dispatcher = require('dispatcher');
 
 const logProgram = 'lib/api';
 const logColor = 'blue';
 const defaultTimeout = 30000;
 const deviceType = OS_IOS ? 'ios' : 'android';
 const mobileAppVersion = Ti.App.version;
 const mobileAppId = Ti.App.id;
 const mobileOSVersion = Ti.Platform.version;
 const authorizationHeader = 'set-authorization';
 const refreshHeader = 'set-refresh';

 /**
  * @method api
  * Creates an instance of Api
  * @return {Object} api instance
  */
 const api = function () {

	 /**
	  * @property {Array} requestsQueue Queue to store requests.
	  */
	 let requestsQueue = [];
 
	 /**
	  * @method pushRequest
	  * @private
	  * Pushes a request into the queue for later processing
	  * @param {Object} _params Details about the request
	  * @return {Void}
	  */
	 const pushRequest = _params => {
		 requestsQueue.push(_params);
	 };
 
	 /**
	  * @method processQueue
	  * @private
	  * Executes the queued requests and dequeues them.
	  * @return {Void}
	  */
	 const processQueue = () => {
		 while (requestsQueue.length > 0) {
			 var requestParameters = requestsQueue.shift();
 
			 request(requestParameters);
		 }
	 };
 
	 /**
	  * @method emptyQueue
	  * @private
	  * Empties the request queue.
	  * @return {Void}
	  */
	 const emptyQueue = () => {
		 requestsQueue = [];
	 };
 
	 /**
	  * @method isNetworkOnline
	  * @private
	  * Returns true if device is online or false otherwise
	  * @return {Boolean}
	  */
	 const isNetworkOnline = () => {
		 if (Ti.Network.online) {
			 return true;
		 }
 
		 return false;
	 };
 
	 /**
	  * @method isFunction
	  * @private
	  * Returns TRUE if the object is a function
	  * @return {Boolean}
	  */
	 const isFunction = fn => {
		 return typeof fn === 'function';
	 };
 
	 /**
	  * @method apiException
	  * @private
	  * Displays an Exception for the developer
	  * @param {Object} _args arguments
	  * @param {String} _args.method who triggered the excpetion
	  * @param {String} _args.message error message
	  * @return {void}
	  */
	 const apiException = _args => {
		 Alloy.Globals.doLog({
			 logType: 'error',
			 text: `${_args.method} - ${_args.message}`,
			 program: logProgram,
			 color: logColor
		 });
	 };
 
	 /**
	  * @method displayErrorMessages
	  * Displays an alert
	  * @param {Object} _args arguments
	  * @return {void}
	  */
	 const displayErrorMessages = _args => {	 
		 let errorMessage = '';
		 if (_args.serverError && (_args.serverError.messages || _args.serverError.message)) {
			 if (_args.serverError.messages) {
				 // MNKY-75
				 _args.serverError.messages.forEach(message => {
					if (!_.isEmpty(message)) {
					 	errorMessage = `${message}\r\n`;
				 	}
				 });
			 }
			 if (_args.serverError.message) {
				 errorMessage += `${_args.serverError.message}`;
			 }
		 } else {
			 errorMessage = 'Unknown error';
		 }
		 alertDialogHelper.createAlertDialog({
			 title: '',
			 message: errorMessage
		 }).show();
	 };
 
	 /**
	  * @method validateRequiredParameters
	  * @private
	  * Validates that all required parameters are passed
	  * @param {String} _method method name
	  * @param {Object} _args arguments passed to the method
	  * @param {Object} _required required arguments
	  * @return {Boolean}
	  */
	 const validateRequiredParameters = (_method, _args, _required) => {
		 let exceptionMessage = '';
		 _required.forEach(parm => {
			 if (!_args.hasOwnProperty(parm)) {
				 exceptionMessage += `"${parm}" is a required parameter.\r\n`;
			 }
		 });
		 if (exceptionMessage.length > 0) {
			 apiException({
				 method: _method,
				 message: exceptionMessage
			 });
			 return false;
		 }
		 return true;
	 };
 
	 /**
	  * @method parseResponseHeaders
	  * @private
	  * Parses http response headers and extracts the important ones
	  * @param {Object} httpResponse http response object
	  * @return {Object}
	  */
	 const parseResponseHeaders = httpResponse => {
		 let responseHeaders = {};
		 responseHeaders[authorizationHeader] = httpResponse.getResponseHeader(authorizationHeader);
		 responseHeaders[refreshHeader] = httpResponse.getResponseHeader(refreshHeader);
		 return responseHeaders;
	 };
 
	 const createRequestId = () => {
		 return Math.floor(100000000 + Math.random() * 900000000);
	 };
 
	 /**
	  * @method request
	  * @private
	  * Sends a request to the server
	  * @param {Object} _params Arguments
	  * @param {String} _params.url Url
	  * @param {String} _params.method = GET Request method: GET, POST, PUT, DELETE
	  * @param {Object} _params.req Request body for POST and PUT
	  * @param {Function} _params.onSuccess callback for success response
	  * @param {Function} _params.onError callback for error response
	  * @param {Boolean} _params.authenticated = false should the call be authenticated with token 
	  * @return {void}
	  */
	 const request = _params => {
		 const {
			 url,
			 method = 'GET',
			 req = null,
			 onSuccess = null,
			 onError = null,
			 authenticated = false,
			 headers = [],
			 version = '0.1'
		 } = _params;
 
		 if (!isNetworkOnline()) {
			 Alloy.Globals.doLog({
				 logType: 'error',
				 text: `request() - ${method} ${url} - NO INTERNET`,
				 program: logProgram,
				 color: logColor
			 });
			 onError && onError({
				 status: 'fail',
				 messages: [
					 'No internet connection'
				 ]
			 });
			 return;
		 }
		 let clone = Object.assign({}, req);
		 if (clone.hasOwnProperty('password')) {
			 clone.password = '******';
		 }
 
		 let xhr = Ti.Network.createHTTPClient();
 
		 xhr.onload = function (_e) {
			 //_e && console.warn('onload: ' + JSON.stringify(_e));
			 Alloy.Globals.doLog({
				 text: `request() - ${method} ${url} - SUCCESS`,
				 program: logProgram,
				 color: logColor
			 });
			 networkHelper.destroySlowConnectionTimeout();
			 networkHelper.updateInternetSpeed({
				 type: 'RESPONSE',
				 id: requestId,
				 method: method
			 });
 
			 // get only important response headers
			 let responseHeaders = parseResponseHeaders(this);
 
			 // Check for jwt new tokens
			 responseHeaders && responseHeaders.hasOwnProperty(refreshHeader) && (refreshToken =
				 responseHeaders[refreshHeader]);
			 responseHeaders && responseHeaders.hasOwnProperty(authorizationHeader) && (
				 authorizationToken = responseHeaders[authorizationHeader]);
 
			 if (refreshToken && authorizationToken) {
				 // update tokens		
				 Alloy.Globals.doLog({
					 text: `request() - ${method} ${url} - Update JWT Auth Token: ${authorizationToken} Refresh: ${refreshToken}`,
					 program: logProgram,
					 color: logColor
				 });
				 Alloy.Globals.updateTokens(authorizationToken, refreshToken);
			 }
 
			 onSuccess && onSuccess({
				 headers: responseHeaders,
				 data: JSON.parse(this.responseText)
			 });
		 };
 
		 xhr.ondatastream = function (_e) {
			 //_e && console.warn('ondatastream: ' + JSON.stringify(_e));
		 };
		 xhr.onsendstream = function (_e) {
			 //_e && console.warn('onsendstream: ' + JSON.stringify(_e));
		 };
		 xhr.onreadystatechange = function (_e) {
			 //_e && console.warn('onreadystatechange: ' + JSON.stringify(_e));
		 };
 
		 xhr.onerror = function (error) {
			 Alloy.Globals.doLog({
				 logType: 'error',
				 text: `request() - ${method} ${url} - ERROR: (${error.code}) ${this.responseText}`,
				 program: logProgram,
				 color: logColor
			 });
			 networkHelper.destroySlowConnectionTimeout();
			 networkHelper.updateInternetSpeed({
				 type: 'ERROR',
				 id: requestId,
				 method: method
			 });
 
			 // 2021-01-08 when jwt token expires, the api returns 200 and the auth and refresh tokens in the header
			 // so no need to check for 403 or retry requests
 
			 if (isNetworkOnline() && authenticated && error.code && error.code === 403) {
 
				 Alloy.Globals.doLog({
					 text: `request() - ${method} ${url} - Could not refresh tokens - Logout`,
					 program: logProgram,
					 color: logColor
				 });
 
				 let responseHeaders = parseResponseHeaders(this);
 
				 Alloy.Globals.updateTokens();
				 sessionHelper.destroySessionData();
 
				 // Old api
				 authorization.logOut(function (e) {
					 dispatcher.trigger("refreshItemList");
					 appNavigation.openLogin();
				 });
 
				 return;
			 }
 
			 let response = null;
 
			 try {
				 response = JSON.parse(this.responseText);
			 } catch (err) {
				 response = {
					 status: 'fail',
					 messages: [
						 'Unknown reason (could not parse response).'
					 ]
				 };
			 }
 
			 onError && onError({
				 httpError: error,
				 serverError: response
			 });
		 };
		 xhr.open(method, url);
 
		 let allHeaders = [],
			 allHeadersLog = '';
 
		 (method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'PUT' || method.toUpperCase() ===
			 'DELETE') &&
		 allHeaders.push({
			 headerName: 'X-HTTP-Method-Override',
			 headerValue: method.toUpperCase()
		 });
 
		 allHeaders.push({
			 headerName: 'Content-Type',
			 headerValue: 'application/vnd.api+json' //`application/json; version=${version}`
		 });
		 allHeaders.push({
			 headerName: 'Accept',
			 headerValue: 'application/vnd.api+json' //'application/json'
		 });
		 allHeaders.push({
			 headerName: 'User-Agent',
			 headerValue: deviceType
		 });
		 allHeaders.push({
			 headerName: 'Mobile-App-Id',
			 headerValue: mobileAppId
		 });
		 allHeaders.push({
			 headerName: 'Mobile-App-Version',
			 headerValue: mobileAppVersion
		 });
		 allHeaders.push({
			 headerName: 'Mobile-OS-Version',
			 headerValue: mobileOSVersion
		 });
		 authenticated && allHeaders.push({
			 headerName: 'Authorization',
			 headerValue: `Bearer ${Alloy.Globals.authorizationTokenV2}`
		 });
		 authenticated && allHeaders.push({
			 headerName: 'Refresh',
			 headerValue: `${Alloy.Globals.refreshTokenV2}`
		 });
 
		 // add custom headers
		 headers.forEach(header => {
			 allHeaders.push({
				 headerName: header.key,
				 headerValue: header.value
			 });
		 });
 
		 xhr.timeout = defaultTimeout;
 
		 allHeaders.forEach(header => {
			 xhr.setRequestHeader(header.headerName, header.headerValue);
			 allHeadersLog += `"${header.headerName}":"${header.headerValue}" `;
		 });
 
		 Alloy.Globals.doLog({
			 text: `request() - ${method} ${url} - HEADERS: ${allHeadersLog} - BODY: ${clone.length}`,
			 program: logProgram,
			 color: logColor
		 });

		 (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') && xhr.send();
		 (method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'POST' || method.toUpperCase() ===
			 'PUT') && xhr.send(JSON.stringify(req));
 
		 networkHelper.createSlowConnectionTimeout();
		 let requestId = createRequestId();
		 networkHelper.updateInternetSpeed({
			 type: 'REQUEST',
			 id: requestId,
			 method: method
		 });
 
		 return xhr;
	 };
 
	 // API Domain public interfase
	 let apiDomain = {
		 authentication: {},
		 media: {},
		 helpers: {
			 displayErrorMessages
		 },
		 external: {}
	 };
 
     function generateGUID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    };

    apiDomain.media.upload = _args => {
        let required = ['media'];

        if (!validateRequiredParameters('media.upload', _args, required)) {
            return;
        }

        _args.url = "https://imagine.fluidmarket.com/images";
        _args.authenticated = true;
        _args.method = 'POST';

        const fileSize = null;
        const width = _args.width || null;
        const height = _args.height || null;
        const postData = {
            data: {
                attributes: {
                    type: 'other',
                    image: {
                        width: width,
                        height: height,
                        fileSize: fileSize,
                        data: Ti.Utils.base64encode(_args.media)
                        .toString()
                        .replace(/\r\n/g, "")
                    }
                }
            }
        };                
        _args.req = postData;

        return request(_args);
    };     

	 return {
		 api: apiDomain
	 };
 }();
 
 module.exports = api;
 