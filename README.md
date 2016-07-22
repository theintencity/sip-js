# SIP in JavaScript #

> This project was migrated from <https://code.google.com/p/sip-js> on May 17, 2015  
> Keywords: *SIP*, *JavaScript*, *VoIP*, *Browser*  
> Members: *kundan10* (Project Manager), *mamtasingh05* (JavaScript/CSS expert), *theintencity* (Flash Network)  
> Links: [Support](http://groups.google.com/group/myprojectguide), [Video](http://www.youtube.com/watch?v=tfwmBgJHpWs), [Demo](http://theintencity.com/sip-js/phone.html)  
> License: [GNU Lesser GPL](http://www.gnu.org/licenses/lgpl.html)  
> Others: starred by 52 users  

![logo](/assets/logo.png)

This project provides a complete SIP stack in JavaScript for implementing SIP based audio and video user agents in the browser or mobile. 

We ported the SIP stack of the [p2p-sip](https://github.com/theintencity/p2p-sip) project from Python to JavaScript and created an example web-based video phone application for demonstration. The web phone supports audio, video and text chat, and can work with Flash or WebRTC media stack. Furthermore, we built a mobile app using Cordova to run on Android.

# Motivation #
The main motivation of this project is to move the complexity of SIP and related protocols to the end-point and to promote end-to-end communication from the web browser instead of relying on server side SIP translation such as a [SIP-RTMP gateway](https://github.com/theintencity/rtmplite/blob/master/siprtmp.md).

The initial work done in this project was later published in an IEEE paper titled, [a case for SIP in JavaScript](http://kundansingh.com/papers/2013-sip-js-private.pdf). The paper describes the motivation, challenges and comparison with alternatives.

The project implements SIP and related standards in JavaScript: RFC 3261, RFC 4566, RFC 3264. Any complex telephony or application specific standard that relies on "managed" services mode instead of services in the end-point is outside the scope of this project. If you need web phones with "managed" services in the back end, then there are other better alternatives in our opinion instead of SIP in Javascript in the browser.

## Challenges ##
Currently, native browsers do not expose JavaScript API for primitive capabilities such as UDP or TCP socket, microphone and camera access. We keep the network and device part flexible so that the application can use either the WebRTC effort driven by Google and available in the Chrome and other browsers, or the browser plugins such as Flash Player via the separate [flash-network](http://theintencity.kundansingh.com/flash-network/) project.

Consequently, for the web application, the SIP transport can be over UDP or TCP and the media path using RTP/RTCP when using the Flash Player plugin, and the transport can be over WebSocket and the media path over WebRTC when using a WebRTC-capable browser.

Furthermore, we have used Cordova to convert the web application to desktop and mobile app. Consequently, the SIP transport can be over UDP, TCP or WebSocket when using the desktop or mobile app. However, the media path is always WebRTC in the desktop or mobile app.

# Implementation #
The implementation of SIP in Javascript is available as [sip.js](/sip.js) along with an example phone application in [index.html](/web/index.html) and [index.js](/web/index.js). The previous phone.html application was expanded to index.html by adding support for diverse devices, and to run as a desktop or mobile app, in addition to the web application.

## Demonstration ##
You can view our demonstration video at [http://www.youtube.com/watch?v=tfwmBgJHpWs](http://www.youtube.com/watch?v=tfwmBgJHpWs).

We have created a [Web-based SIP phone](http://theintencity.com/sip-js/phone.html) application for demonstration. This is based on the earlier version of this project. It has been tested on Chrome, but should work on Firefox and Safari, and may work on Internet Explorer. The demonstration page includes a "Getting Started" guide if you would like to use it. The source code is available as open source here.

## Getting Started ##

To run the system locally, you need a SIP server and a web server. Ideally you should run the SIP server on the same host as your web server for the demo. Please send a mail to the support group if you face problem running the demo.

You can use the SIP server of [rtclite](https://github.com/theintencity/rtclite) project, or any other SIP server of your choice. Use the following command in your `rtclite` project directory to start the SIP server using only the UDP transport. 
```
python -m rtclite.app.sip.server -d -t udp -l 0.0.0.0:5060
```

If you are not using the demonstration link shown above, you can instead run the built-in Python web server in the `sip-js` project directory as follows, and then visit [index.html](http://localhost:8000/web/index.html) on your local machine.
```
python -m SimpleHTTPServer 8000
```

Once the page shows the user interface, you can enable various boxes by clicking on the edit button in that box. Click on the help button to learn more about a box. For example, you can change the common SIP-related configuration in the configuration box. An example web application screenshot in an active call between two tabs of the browser is shown below.

![screenshot](/assets/screen2.png)

Many of the configuration parameters can be set via URL parameters, e.g., by appending `?username=kundan&domain=iptel.org` to your phone URL, the user name and domain fields get those default values. This helps in quick testing where you can open multiple tabs with different phone configurations. For example, you can click on the [first user](http://localhost:8000/web/index.html?username=firstuser&authname=firstuser&password=firstpasswd&displayname=First%20User) and [second user](http://localhost:8000/web/index.html?username=seconduser&authname=seconduser&password=secondpasswd&displayname=Second%20User) links to launch the local web app for two different users, and see the corresponding parameters.


## Using WebRTC ##

The default demonstration application uses the Flash Network project for network and devices. To change to use the SIP over WebSocket with native WebRTC implementation of Google Chrome, checkout the latest sources, put them under a web server, run a local SIP proxy server that supports SIP over WebSocket, and visit  `web/phone.html?network_type=WebRTC` in your browser URL.

You can use the SIP server of [rtclite](https://github.com/theintencity/rtclite) project that supports SIP over WebSocket. Use the following command in your `rtclite` project directory to start the SIP server with WebSocket transport listening on local port 5080. 
```
python -m rtclite.app.sip.server -d -t ws -l 0.0.0.0:5080 -r localhost
```

Alternatively, to start the server supporting both WebSocket and UDP transport use the following command.
```
python -m rtclite.app.sip.server -d -t ws -l 0.0.0.0:5080 -t udp -l 0.0.0.0:5060
```

Vitali Fomine has kindly reported that the SIP server of [OfficeSIP](http://www.officesip.com) 3.2+ also works with sip-js as well as others ([Youtube Video](http://www.youtube.com/watch?v=006YInl2f2w), [Russian](http://habrahabr.ru/post/144129/)). This gives you a wider choice on available SIP servers supporting WebSocket.

We have integrated the WebRTC-based media with pre-standard SIP over WebSocket. You can click on the change link in the network box to change from Flash Network to WebRTC, and that in turn will also change the transport by default to WebSocket (WS). Using the URL parameters, you may also click on the [first user](http://localhost:8000/web/index.html?network_type=WebRTC&username=firstuser&authname=firstuser&password=firstpasswd&displayname=First%20User) and [second user](http://localhost:8000/web/index.html?network_type=WebRTC&username=seconduser&authname=seconduser&password=secondpasswd&displayname=Second%20User) links to launch the web app for two different users but with WebRTC mode, and see the corresponding parameters.

Our SIP server can bridge between SIP endpoints on UDP and WebSocket. Developers are encouraged to see the server logs for the case when the two endpoints are on WebSocket [proxy-log.txt](/assets/proxy-log.txt) and the other case when the two endpoints are on different transports [proxy-log2.txt](/assets/proxy-log2.txt). The second log file also shows various failure cases such as when the call is cancelled or rejected.

Note that Google Chrome allows certain WebRTC APIs such as to capture camera and microphone, only when the web page is accessed over secure transport, `https`, or on `localhost`. If you install the code on your web server, make sure to use secure transport to access the web application.

## Building the mobile app ##

We have used Chrome Cordova App tools and framework to convert the web application to desktop and mobile app. Currently, the desktop and mobile app always use WebRTC mode, but can use any transport for SIP. You can find pre-built `apk` files for Android under the [download](/theintencity/sip-js/tree/download) branch. Here, we describe how to build this yourself.

Follow the steps mentioned in [chrome apps for mobile](https://github.com/MobileChromeApps/mobile-chrome-apps/) page. In particular, install the necessary dependencies - `Nodejs`, Java JDK, Android SDK, command-line `cca`. In Android SDK, you may also need to install SDK Platforms, Android SDK Tools, Android SDK Platform-tools, Android SDK Build-tools, Android Support Repository and Google Repository. We use `cca` version 0.8.1 but others should work too.
```
$ cca create mobile net.example.yourproject --link-to=web/manifest.json
$ cd mobile
$ cca run android
```

One gotcha is that `crosswalk` 1.7 causes a content security policy violation when assigning a media stream URL to a video element's `src`. You may need to force install version 1.6 if you face this problem.
```
cca plugin rm  cordova-plugin-crosswalk-webview
cca plugin add  cordova-plugin-crosswalk-webview@1.6.0
```
Earlier versions of cordova/crosswalk caused problem with only-front facing camera devices such as a tablets, and required adding a custom `android:required="false"` flag for camera related features in the manifest file. But this bug seems to be fixed now.

Use the steps mentioned in the linked page above to generate the `apk` installer. Our recent build uses the following configuration for cordova platforms and plugins in this project.
```
$ cca platforms list
Installed platforms: android 5.0.0, ios 3.9.2
$ cca plugins list
cordova-plugin-background-app 2.0.2 "Background App"
cordova-plugin-blob-constructor-polyfill 1.0.2 "Blob constructor shim"
cordova-plugin-chrome-apps-audiocapture 1.0.5 "Chrome AudioCapture API"
cordova-plugin-chrome-apps-bootstrap 3.0.1 "Chrome Apps Core"
cordova-plugin-chrome-apps-common 1.0.7 "Chrome Apps Common Utils"
cordova-plugin-chrome-apps-i18n 2.0.1 "Chrome Apps I18n API"
cordova-plugin-chrome-apps-iossocketscommon 1.0.2 "Chrome Apps iOS Sockets Common"
cordova-plugin-chrome-apps-navigation 1.0.4 "Chrome Apps Navigation"
cordova-plugin-chrome-apps-runtime 2.0.0 "Chrome App Runtime"
cordova-plugin-chrome-apps-sockets-udp 1.2.2 "Chrome Apps Sockets UDP API"
cordova-plugin-chrome-apps-storage 1.0.4 "Chrome Apps Storage API"
cordova-plugin-chrome-apps-system-network 1.1.2 "Chrome System Network API"
cordova-plugin-chrome-apps-videocapture 1.0.4 "Chrome VideoCapture API"
cordova-plugin-compat 1.0.0 "Compat"
cordova-plugin-crosswalk-webview 1.6.0 "Crosswalk WebView Engine"
cordova-plugin-customevent-polyfill 1.0.5-dev "CustomEvent constuctor shim"
cordova-plugin-file 4.2.0 "File"
cordova-plugin-inappbrowser 1.4.0 "InAppBrowser"
cordova-plugin-network-information 1.2.1 "Network Information"
cordova-plugin-statusbar 2.1.3 "StatusBar"
cordova-plugin-whitelist 1.0.0 "Whitelist"
cordova-plugin-xhr-blob-polyfill 1.0.3 "XHR Blob Response Type Polyfill"
org.chromium.cca-hooks 0.0.0 "undefined"
```

## Responsive User Interface ##

We have changed the user interface of the example web video phone application to adapt to the available window size. This is particularly useful for desktop and mobile app. The application shows all the boxes if the window is big enough. If the window is not big or when running on a mobile app, the application shows a compact user interface, which has only two boxes at a time, with tabbed navigation buttons at the bottom. Sample user interfaces for landscape and portrait device orientation are shown below.

<img src="/assets/screen3.png" style="border: solid 1px #808080; width: 75%; " />

<img src="/assets/screen4.png" style="border: solid 1px #808080; width: 75%; " />

The compact user interface enables the buttons in a box when you click on a box, instead of showing the edit or save button. Furthermore, the program log box is not shown in the compact mode. Other than these differences, the compact user interface behaves the same as the full interface.

## Warning ##

The web phone application is only for demonstration purpose, and not robust for use in any production environment. The idea is to create a web-phone prototype and show that SIP in Javascript is feasible for better end-to-end communication instead of depending on server-side SIP translation.

# Elsewhere #

There are other similar projects that implement a SIP stack in Javascript and a SIP endpoint using HTML5. The first demonstration done on this technology was the [SIP on the web](http://www.youtube.com/watch?v=qfFlK1KyF6Q) project by José Millán and Iñaki Castillo. Although [sipml5](http://code.google.com/p/sipml5/) looks promising, our humble observation is that it is _not_ the world's first open source HTML5 SIP client, as falsely boosted on their project website, because SIP on the web and this open source SIP-JS projects were available before sipml5 (unless the authors of SIP-on-the-web created sipml5).

The SIP-over-WebSocket concept is also gaining popularity in the SIP community. A partial list of SIP servers that support this: [OfficeSIP](http://www.officesip.com/), [Kamailio](http://www.kamailio.org/w/2012/07/websockets/), [p2p-sip](https://github.com/theintencity/p2p-sip)' sipd.py, [rtclite](https://github.com/theintencity/rtclite)' server.py.

Please get in touch with the [project owner](mailto:theintencity@gmail.com) if you would like to add a reference to your implementation or would like to correct the information in this section.
