# SIP in JavaScript #

> This project was migrated from <https://code.google.com/p/sip-js> on May 17, 2015  
> Keywords: *SIP*, *JavaScript*, *VoIP*, *Browser*  
> Members: *kundan10* (Project Manager), *mamtasingh05* (JavaScript/CSS expert), *theintencity* (Flash Network)  
> Links: [Support](http://groups.google.com/group/myprojectguide), [Video](http://www.youtube.com/watch?v=tfwmBgJHpWs), [Demo](http://theintencity.com/sip-js/phone.html)  
> License: [GNU Lesser GPL](http://www.gnu.org/licenses/lgpl.html)  
> Others: starred by 52 users  

![logo](/logo.png)

This project aims at providing a complete SIP stack in Java script for implementing SIP based audio and video user agents in the browser. This is not related to the server side sip.js project.

We have ported the SIP stack of the [p2p-sip](https://github.com/theintencity/p2p-sip) project from Python to Java script and created an example web phone application for demonstration.

# Motivation #
The main motivation of this project is to move the complexity of SIP and related protocols to the end-point and to promote end-to-end communication from the web browser instead of relying on server side SIP translation such as a SIP-RTMP gateway.

The project implements SIP and related standards in Javascript: RFC 3261, RFC 4566, RFC 3264. Any complex telephony or application specific standard that relies on "managed" services mode instead of services in the end-point is outside the scope of this project. If you need web phones with "managed" services in the back end, then there are other better alternatives in our opinion instead of SIP in Javascript in the browser.

## Challenges ##
Currently, native browsers do not expose Java script API for primitive capabilities such as UDP or TCP socket, microphone and camera access. We keep the network and device part flexible so that the application can use either the WebRTC effort proposed by Google and available in the Chrome (development release) browser, as well as the browser plugins such as Flash Player via the separate [flash-network](https://github.com/theintencity/flash-network) project.

# Implementation #
An initial prototype implementation of SIP in Javascript is available as [sip.js](/sip.js) along with an example phone application in [phone.html](/phone.html) and [phone.js](/phone.js).

## Demonstration ##
You can view our demo video at [http://www.youtube.com/watch?v=tfwmBgJHpWs](http://www.youtube.com/watch?v=tfwmBgJHpWs).

We have created a [Web-based SIP phone](http://theintencity.com/sip-js/phone.html) application for demonstration.  It has been tested on Chrome, but should work on Firefox and Safari, and may work on Internet Explorer. The demonstration page includes a "Getting Started" guide if you would like to use it. The source code is available in SVN in this project.

The default demonstration application uses the Flash Network project for network and devices. To change to use the SIP over `WebSocket` with native `WebRTC` extensions of the Google Chrome [Canary](http://www.webrtc.org/running-the-demos) release, checkout the latest sources, put them under a web server, run a local SIP proxy server that supports SIP over `WebSocket`, and visit  `phone.html?network_type=WebRTC` in your browser URL. You can use the [sipd](https://github.com/theintencity/p2p-sip) (/src/app/sipd.py) SIP server of [p2p-sip](https://github.com/theintencity/p2p-sip/) project that supports SIP over `WebSocket`. Ideally you should run the SIP server on the same host as your web server for the demo. Please send a mail to the support group if you face problem running the demo.
```
python app/sipd.py -d -t ws -l 0.0.0.0:5080 -r localhost
```

**New**: Vitali Fomine has kindly reported that the SIP server of [OfficeSIP](http://www.officesip.com) 3.2+ also works with sip-js as well as others ([Youtube Video](http://www.youtube.com/watch?v=006YInl2f2w), [Russian](http://habrahabr.ru/post/144129/)). This gives you a wider choice on available SIP servers supporting WebSocket.

## Developers ##
If you are a Web/Javascript developer and interested in contributing to this real-time communication project that promotes end-to-end communication, please send a note to the [support](http://groups.google.com/group/myprojectguide) group with your background, and we will consider adding you to the project.

Many of the configuration parameters can be set via URL parameters, e.g., by appending `?username=kundan&domain=iptel.org` to your phone URL, the user name and domain fields get those default values. This helps in quick testing where you can open multiple tabs with different phone configurations.

We have integrated the pre-standard `WebRTC`-based media with SIP over `WebSocket`. A number of things still remain to be done. <b>We are looking</b> for developers interested in further exploring this project.

## Users ##
The web phone application is only for demonstration purpose, and not robust for use in any production environment. The idea is to create a web-phone prototype and show that SIP in Javascript is feasible for better end-to-end communication instead of depending on server-side SIP translation.

# Elsewhere #

There are other similar projects that implement a SIP stack in Javascript and a SIP endpoint using HTML5. The first demonstration ever done on this technology was the [SIP on the web](http://www.youtube.com/watch?v=qfFlK1KyF6Q) project by José Millán and Iñaki Castillo. Although [sipml5](http://code.google.com/p/sipml5/) looks promising, our humble observation is that it is _not_ the world's first open source HTML5 SIP client, as falsely boosted on their project website, because SIP on the web and this open source SIP-JS projects were available before sipml5 (unless the authors of SIP-on-the-web created sipml5).

The SIP-over-WebSocket concept is also gaining popularity in the SIP community. A partial list of SIP servers that support this: [OfficeSIP](http://www.officesip.com/), [Kamailio](http://www.kamailio.org/w/2012/07/websockets/), [p2p-sip](https://github.com/theintencity/p2p-sip)' sipd.py

Please get in touch with the [project owner](mailto:theintencity@gmail.com) if you would like to add a reference to your implementation or would like to correct the information in this section.
