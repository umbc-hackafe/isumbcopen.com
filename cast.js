/**
 * Cast initialization timer delay
 **/
var CAST_API_INITIALIZATION_DELAY = 1000;
/**
 * Session idle time out in miliseconds
 **/
var SESSION_IDLE_TIMEOUT = 300000;

/**
 * global variables
 */
var currentMediaSession = null;
var currentVolume = 0.5;
var progressFlag = 1;
var mediaCurrentTime = 0;
var session = null;
var timer = null;

/**
 * Call initialization
 */
if (!chrome.cast || !chrome.cast.isAvailable) {
  setTimeout(initializeCastApi, CAST_API_INITIALIZATION_DELAY);
}

/**
 * initialization
 */
function initializeCastApi() {
  // default app ID to the default media receiver app
  // optional: you may change it to your own app ID/receiver
  var applicationIDs = [
      'BAAFE39F', // our app
//      'BE6E4473', // hosted reference app
      chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    ];


  // auto join policy can be one of the following three
  // 1) no auto join
  // 2) same appID, same URL, same tab
  // 3) same appID and same origin URL
  var autoJoinPolicyArray = [
      chrome.cast.AutoJoinPolicy.PAGE_SCOPED,
      chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED,
      chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    ];

  // request session
  var sessionRequest = new chrome.cast.SessionRequest(applicationIDs[0]);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    sessionListener,
    receiverListener,
    autoJoinPolicyArray[1]);

  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

/**
 * initialization success callback
 */
function onInitSuccess() {
  // check if a session ID is saved into localStorage
  storedSession = JSON.parse(localStorage.getItem('storedSession'));
  if (storedSession) {
    var dateString = storedSession.timestamp;
    var now = new Date().getTime();
  }
}

/**
 * launch app and request session
 */
function launchApp() {
  console.log('launching app...');
  document.getElementById("castbutton").innerHTML = "<img src=\"active.png\" width=80 height=60/>";
  chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
  if (timer) {
    clearInterval(timer);
  }
}

/**
 * session listener during initialization
 * @param {Object} e session object
 * @this sessionListener
 */
function sessionListener(e) {
  console.log('New session ID: ' + e.sessionId);
  session = e;
  session.addUpdateListener(sessionUpdateListener.bind(this));
}

/**
 * receiver listener during initialization
 * @param {string} e status string from callback
 */
function receiverListener(e) {
  if (e === 'available') {
    console.log('receiver found');
    document.getElementById("casticon").style.visibility = "visible";
  }
  else {
    console.log('receiver list empty');
  }
}

/**
 * generic error callback
 * @param {Object} e A chrome.cast.Error object.
 */
function onError(e) {
  console.log('Error' + e);
}

/**
 * callback on success for requestSession call
 * @param {Object} e A non-null new session.
 * @this onRequestSesionSuccess
 */
function onRequestSessionSuccess(e) {
  console.log('session success: ' + e.sessionId);
  session = e;
}

/**
 * callback on launch error
 */
function onLaunchError() {
  console.log('launch error');
}
