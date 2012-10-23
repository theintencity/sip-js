// Copyright (c) 2011-2012, Intencity Cloud Technologies
// Copyright (c) 2011-2012, Kundan Singh
// This software is licensed under LGPL.
// See README and http://code.google.com/p/sip-js for details.

function getFlashMovie(name) {
    var isIE = navigator.appName.indexOf("Microsoft") != -1;
    return (isIE) ? window[name] : document[name];
}

function getQuerystring(key, default_) {
    if (default_==null)
        default_=""; 
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(window.location.href);
    return (qs == null ? default_ : qs[1]);
}

function cleanHTML(value) {
    return ("" + value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function Phone() {
    // properties in config
    this.displayname = 'First Last';
    this.username = 'myname';
    this.domain = 'localhost';
    this.authname =  'myname';
    this.password = '';
    this.transport = 'udp';
    
    // properties in register
    this.outbound = 'proxy';
    this.outbound_proxy_address ='127.0.0.1:5060';
    this.register_interval = 180;
    this.rport = true;
    this.sipoutbound = false;
    this.local_aor = '"' + this.displayname + '" <sip:' + this.username + '@' + this.domain + '>';
    this.sock_state = "idle";
    this.register_state = "not registered";
    this.register_button = 'Register';

    // properties in call
    this.call_state = "idle";
    // possible state values:
    //     idle - not in a call (may not have socket)
    // outbound call:
    //     waiting - want to initiate a call, and waiting for socket connection
    //     inviting - sending outbound INVITE, may be waiting for media
    //     ringback - received 18x response for outbound INVITE
    //     accepted - received 2xx response for outbound INVITE
    //     active - sent ACK for outbound INVITE
    // incoming call:
    //     incoming - received incoming INVITE
    //     accepting - accepted an incoming INVITE, waiting for media
    // failure, termination
    //     failed - outbound/inbound call failed due to some reason
    //     closed - call is closed by remote party

    this.target_scheme = "sip";
    this.target_value = "yourname@localhost";
    this.target_aor = this.target_scheme + ":" + this.target_value;
    this.has_audio = true;
    this.has_tones = false;
    this.has_video = true;
    this.has_text = false;
    this.has_location = false;
    this.location = null;
    
    // properties in network
    this.network_status = null;
    
    //properties in program log
    this.log_scroll = true;
    
    // private attributes
    this._handlers = {};
    this.network_type = "Flash";
    this.listen_ip = null;
    this._listen_port = null;
    this._stack = null;
    this._sock = null;
    this._next_message = null;
    
    // SIP headers
    this.user_agent = "sip-js/1.0";
    this.server = this.user_agent;
    
    // media context
    this._local_sdp = null;
    this._remote_sdp = null;
    this._rtp = []; // RealTimeSocket instances
    this._gw = null;
    
    // HTML5
    this.has_html5_websocket = false;
    this.has_html5_video = false;
    this.has_html5_webrtc = false;
    this.websocket_path = "/sip";
    this._webrtc_local_stream = null;
    this._webrtc_peer_connection = null;
    this.enable_sound_alert = false;
    this.webrtc_servers = "stun://stun.l.google.com:19302"; // comma separated list, each item is either "url" or "url|credential"
    this._sdp_timeout = 500; // 0.5s after calling createOffer or createAnswer, use the SDP
    
    // SIP requirements for websocket
    this._instance_id = "";
    this._gruu = "";
};

Phone.prototype.populate = function() {
    for (var attr in this) {
        var def = this[attr];
        if ((typeof def != "function") && attr.charAt(0) != "_") {
            var param = getQuerystring(attr, def);
            if (typeof this[attr] == "number")
                param = (typeof param == "number" ? param : parseInt(param));
            else if (typeof this[attr] == "boolean")
                param = (typeof param == "boolean" ? param : (param != "false" ? true : false));
            else
                param = unescape(param);
            if (def == param)
                this.dispatchEvent({"type": "propertyChange", "property": attr, "newValue": param});
            else
                this.setProperty(attr, param);
        }
    }
};

Phone.prototype.detectHTML5 = function() {
    this.setProperty("has_html5_websocket", typeof WebSocket != "undefined");
    this.setProperty("has_html5_video", !!document.createElement('video').canPlayType);
    this.setProperty("has_html5_webrtc", typeof navigator.webkitGetUserMedia != "undefined" && typeof webkitRTCPeerConnection != "undefined");
    log("detecting HTML support websocket=" + this.has_html5_websocket + " video=" + this.has_html5_video + " webrtc=" + this.has_html5_webrtc);
    if (!this.has_html5_websocket || !this.has_html5_video || !this.has_html5_webrtc) {
        $("webrtc-network").innerHTML += '<font color="red">Some HTML5 features are missing in your browser</font>';
    }
    
    if (this.has_html5_websocket) {
        // SIP over websocket works
        this.setProperty("network_status", "available");
        this.enableButtons(true);
        this.enableBox('config', true);
        $("websocket_path").value = this.websocket_path;
        $("webrtc_servers").value = this.webrtc_servers;
        $("listen_ip").style.visibility = "hidden";
        
        this.listen_ip = 'r' + Math.floor(Math.random() * 10000000000) + ".invalid";
        this._listen_port = 0;

        if (this.outbound_proxy_address == "127.0.0.1:5060") {
            var outbound_proxy_address = "127.0.0.1:5080";
            if (window.location.href) {
                var uri = sip.parse_uri(window.location.href);
                outbound_proxy_address = uri.host + ":5080";
            }
            this.setProperty("outbound_proxy", true);
            this.setProperty("outbound_proxy_address", outbound_proxy_address);
        }
    }
    
    if (this.has_html5_video) {
        // add <video> to local and remote video boxes
        var local = document.createElement("video");
        local.id = "html5-local-video";
        local.style.width = "240";
        local.style.height = "168";
//        local.style.backgroundColor = "#000000";
        local.autoplay = "autoplay";
        $('local-video').appendChild(local);
        
        var remote = document.createElement("video");
        remote.id = "html5-remote-video";
        remote.style.width = "240";
        remote.style.height = "168";
//        remote.style.backgroundColor = "#000000";
        remote.autoplay = "autoplay";
        $('remote-video').appendChild(remote);
        
        var audio = document.createElement("audio");
        audio.id = "html5-audio";
        audio.autoplay = "autoplay";
        $("webrtc-network").appendChild(audio);
    }
};

Phone.prototype.addEventListener = function(type, handler) {
    if (this._handlers[type] === undefined)
        this._handlers[type] = [];
    this._handlers[type].push(handler);
};

Phone.prototype.dispatchEvent = function(event) {
//    log("dispatchEvent(" + event.type + ", " + event.property + ", " + event.newValue + ")");
    if (this._handlers[event.type] !== undefined) {
        var handlers = this._handlers[event.type];
        for (var i=0; i<handlers.length; ++i) {
            var handler = handlers[i];
            handler(event);
        }
    }
};

Phone.prototype.setProperty = function(name, value) {
    if (this[name] !== undefined) {
        var oldValue = this[name];
        if (oldValue != value) {
            this[name] = value;
            this.dispatchEvent({"type": "propertyChange", "property": name, "newValue": value, "oldValue": oldValue});
        }
        
        if (name == "username" || name == "domain" || name == "displayname") {
            this.setProperty("local_aor", '"' + this.displayname + '" <sip:' + this.username + '@' + this.domain + '>');
        }
        else if (name == "target_scheme") {
            log("target_scheme=" + value);
            var target_value = {"sip": "yourname@" + this.domain, "tel" : "+12125551234", "urn": "service:sos"}[value];
            this.setProperty("target_value", target_value);
            this.setProperty("target_aor", this.target_scheme + ":" + this.target_value);
        }
        else if (name == "target_value") {
            this.setProperty("target_aor", this.target_scheme + ":" + this.target_value);
        }
        else if (name == "network_type") {
            if (value == "Flash" && this.transport == "ws") {
                this.setProperty("transport", "udp");
            }
            else if (value == "WebRTC" && this.transport != "ws") {
                this.setProperty("transport", "ws");
            }
        }
    }
    else {
        this.dispatchEvent({"type": "propertyChange", "property": name, "newValue": value});
    }
};

Phone.prototype.enableButtons = function(enable) {
    var inputs = ["register_button", "call_button", "target_type", "target_scheme", "target_value"];
    for (var i=0; i<inputs.length; ++i) {
        this.enable(inputs[i], enable);
    }
};

Phone.prototype.statusChanged = function(value) {
    this.setProperty("network_status", value);
    var enable = (value == "connected");
    
    this.enableButtons(enable);
    
    if (enable) {
        // enable config edit only
        this.enableBox("config", true);
    }
    else {
        // disable all edits and reset
        this.enableBox("config", false);
        this.enableBox("register", false);
        this.enableBox("call", false);
        this.enableBox("network", false);
        this.setProperty("sock_state", "idle");
        this.setProperty("register_state", "not registered");
        this.setProperty("call_state", "idle");
        this._listen_port = null;
        this._stack = null;
        this._sock = null;
        this._local_sdp = null;
        this._remote_sdp = null;
        this._rtp = []; // RealTimeSocket instances
        this._gw = null;
    }
};


Phone.prototype.enable = function(name, enable) {
    this.dispatchEvent({"type": "propertyChange", "property": name + ".disabled", "newValue": enable ? false : "disabled"});
};


Phone.prototype.enableBox = function(name, enable) {
    $('edit_' + name).style.visibility = (enable ? "hidden" : "visible");
    $('save_' + name).style.visibility = (enable ? "visible" : "hidden");
    
    var inputs = [];
    if (name == 'config')
        inputs = ["displayname", "username", "domain", "authname", "password"];
        //inputs = ["displayname", "username", "domain", "authname", "password", "transport_udp", "transport_tcp", "transport_ws"];
    else if (name == 'register')
        inputs = ["outbound_target", "outbound_proxy", "outbound_proxy_address", "register_interval", "local_aor"];
        //inputs = ["outbound_domain", "outbound_target", "outbound_proxy", "outbound_proxy_address", "register_interval", "rport", "sipoutbound", "local_aor"];
    else if (name == 'network')
        inputs = ["listen_ip", "network_type", "websocket_path", "enable_sound_alert", "webrtc_servers"];
    else if (name == 'call')
        inputs = ['has_audio', 'has_video', 'has_location'];
        // inputs = ['has_audio', 'has_tones', 'has_video', 'has_text', 'has_location']; // TODO: eventually use this
    
    for (var i=0; i<inputs.length; ++i) {
        this.enable(inputs[i], enable);
    }
    
    if (enable) {
        var boxes = ["config", "register", "call", "network"];
        for (var i=0; i<boxes.length; ++i) {
            if (boxes[i] != name) {
                this.enableBox(boxes[i], false);
            }
        }
    }
    return false;
};

Phone.prototype.networkChanged = function() {
    for (var i=0; i<network.interfaces.length; ++i) {
        var intf = network.interfaces[i];
        if (intf.active) {
            for (var j=0; j<intf.addresses.length; ++j) {
                var addr = intf.addresses[j];
                if (addr.ipVersion == "IPv4") {
                    this.setProperty("listen_ip", addr.address);
                    break;
                }
            }
        }
        if (this.listen_ip)
            break;
    }
};

Phone.prototype.register = function() {
    log("register() " + this.local_aor);
    if (this.sock_state == "idle") {
        this.setProperty("sock_state", "creating");
        this.setProperty("register_state", "waiting");
        this.setProperty("register_button", "Unregister");
        this.setProperty("register_button.disabled", true);
    
        this.createSocket();
    }
    else if (this.sock_state == "bound" || this.sock_state == "connected") {
        if (this._reg && this.register_state != "not registered") {
            this.setProperty("register_state", "unregistering");
            this.setProperty("register_button.disabled", true);
        
            this.sendUnregister();
        }
        else if (this.register_state == "not registered") {
            this.setProperty("register_state", "registering");
            this.setProperty("register_button.disabled", true);
        
            this.sendRegister();
        }
        else {
            log("ignoring register in state " + this.register_state + " " + this._reg);
        }
    }
};

Phone.prototype.changeNetworkType = function() {
    var current = this.network_type;
    var other = (current == 'Flash' ? 'WebRTC' : 'Flash');
    var result = confirm('Using the ' + current + ' network. Would you like to relaunch with the ' + other + ' network');
    if (result) {
        window.location = 'phone.html?network_type=' + other;
    }
    return false;
};

Phone.prototype.call = function() {
    log("call() " + this.target_aor);
    if (this.sock_state == "idle") {
        this.setProperty("sock_state", "creating");
        this.setProperty("call_state", "waiting");
        this.setProperty("call_button.disabled", true);
        this.setProperty("end_button.disabled", false);
        
        this.createSocket();
    }
    else if (this.sock_state == "bound" || this.sock_state == "connected") {
        if (this.call_state == "idle") {
            this.setProperty("call_state", "inviting");
            this.setProperty("call_button.disabled", true);
            this.setProperty("end_button.disabled", false);
            this.sendInvite();
        }
        else if (this.call_state == "incoming") {
            this.setProperty("call_button.disabled", true);
            this.setProperty("end_button.disabled", false);
            this.sendInviteResponse(200, 'OK');
        }
        else {
            this.dispatchMessage("End the existing call first");
        }
    }
};

Phone.prototype.end = function() {
    log("end()");
    if (this.call_state != "idle") {
        if (this.call_state == "inviting" || this.call_state == "ringback") {
            this.sendCancel();
        }
        else if (this.call_state == "incoming") {
            this.sendInviteResponse(603, 'Decline');
        }
        else if (this.call_state == "active" || this.call_state == "accepted" || this.call_state == "accepting") {
            this.sendBye();
        }
        else {
            if (this.call_state != "failed" && this.call_state != "closed") {
                log("ignoring end in " + this.call_state + " state");
            }
            this.hungup();
        }
        this.setProperty("call_button.disabled", false);
        this.setProperty("end_button.disabled", true);
        this.setProperty("call_state", "idle");
    }
};

Phone.prototype.createUUID4 = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

Phone.prototype.createInstanceId = function() {
    if (!this._instance_id && typeof localStorage != "undefined") {
        this._instance_id = localStorage.getItem("instance_id");
        if (!this._instance_id) {
            this._instance_id = "<urn:uuid:" + this.createUUID4() + ">";
            localStorage.setItem("instance_id", this._instance_id);
        }
    }
};

Phone.prototype.createSocket = function() {
    log("createSocket() transport=" + this.transport);
    if (this.transport == "udp") {
        this._sock = new network.DatagramSocket();
        var parent = this;
        this._sock.addEventListener("propertyChange", function(event) { parent.onSockPropertyChange(event); });
        this._sock.addEventListener("data", function(event) { parent.onSockData(event); });
        this._sock.addEventListener("ioError", function(event) { parent.onSockError(event); });
        this._sock.bind(0, "0.0.0.0");
        this._sock.receive();
    }
    else if (this.transport == "ws") {
        log("  connecting to " + this.outbound_proxy_address);
        try {
            this._sock = new WebSocket('ws://' + this.outbound_proxy_address + this.websocket_path, ["sip"]);
            var parent = this;
            this._sock.onopen = function() { parent.onWebSocketOpen(); };
            this._sock.onclose = function() { parent.onWebSocketClose(); };
            this._sock.onerror = function(error) { parent.onWebSocketError(error); };
            this._sock.onmessage = function(msg) { parent.onWebSocketMessage(msg); };
        } catch (error) {
            log("error in websocket: " + error, "error");
        }
    }
    else {
        log(this.transport + " transport is not yet implemented", "error");
        this.setProperty("sock_state", "idle");
        if (this.register_state == "waiting") {
            this.setProperty("register_state", "not registered");
            this.setProperty("register_button", "Register");
            this.setProperty("register_button.disabled", false);
        }
        if (this.call_state == "waiting") {
            this.setProperty("call_state", "idle");
            this.setProperty("call_button.disabled", false);
            this.setProperty("end_button.disabled", true);
        }
    }
};

Phone.prototype.onSockPropertyChange = function(event) {
    if (event.property == "bound") {
        if (event.newValue) {
//            this._listen_port = sock.localPort;
//            log("listen_port=" + this._listen_port);
        }
        else {
            listen_port = null;
            this.resetSockState();
        }
    }
    else if (event.property == "localPort") {
        if (event.newValue) {
            this._listen_port = this._sock.localPort;
            log("listen_port=" + this._listen_port);
            this.setProperty("sock_state", "bound");
            this.createStack();
        }
    }
    else if (event.property == "connected") {
        // TCP or WS socket
        log("socket connected=" + event.newValue);
        if (event.newValue) {
            this.setProperty("sock_state", "connected");
            this.createStack();
        }
        else {
            this.resetSockState();
        }
    }
};

Phone.prototype.resetSockState = function() {
    this.setProperty("sock_state", "idle");
    if (this.register_state == "waiting" || this.register_state == "registered") {
        this.setProperty("register_state", "not registered");
        this.setProperty("register_button", "Register");
        this.setProperty("register_button.disabled", false);
        this._reg = null;
    }
    if (this.call_state == "waiting") {
        this.setProperty("call_state", "idle");
        this.setProperty("call_button.disabled", false);
        this.setProperty("end_button.disabled", true);
    }
    
};

Phone.prototype.createStack = function() {
    var transport = new sip.TransportInfo(this.listen_ip, this._listen_port, this.transport, this.transport == "tls", this.transport != "udp", this.transport != "udp");
    this._stack = new sip.Stack(this, transport);
    
    if (this.register_state == "waiting") {
        this.setProperty("register_state", "registering");
        this.sendRegister();
    }
    
    if (this.call_state == "waiting") {
        this.setProperty("call_state", "inviting");
        this.sendInvite();
    }
    
    if (this._next_message != null) {
        this.sendMessage(this._next_message);
        this._next_message = null;
    }
};

Phone.prototype.sendRegister = function() {
    if (this._reg == null) {
        this._reg = new sip.UserAgent(this._stack);
        this._reg.remoteParty = new sip.Address(this.local_aor);
        this._reg.localParty = new sip.Address(this.local_aor);
        if (this.outbound == "proxy") {
            var outbound_proxy = this.getRouteHeader();
            if (this.transport != "udp")
                outbound_proxy.value.uri.param['transport'] = this.transport;
            this._reg.routeSet = [outbound_proxy];
//            For REGISTER should we change uri instead of routeSet?
//            this._reg.remoteTarget = new sip.URI("sip:" + this.username + "@" + this.outbound_proxy_address);
        }
    } 
    
    var m = this.createRegister();
    m.setItem('Expires', new sip.Header("" + this.register_interval, 'Expires'))
    this._reg.sendRequest(m);
};

Phone.prototype.createRegister = function() {
    var m = this._reg.createRequest('REGISTER');
    var c = new sip.Header(this._stack.uri.toString(), 'Contact');
    c.value.uri.user = this.username;
    if (this.transport == "ws" || this.transport == "wss") {
        this.createInstanceId();
        c.setItem('reg-id', '1');
        c.setItem('+sip.instance', this._instance_id);
        m.setItem('Supported', new sip.Header('path, outbound, gruu', 'Supported'));
    }
    m.setItem('Contact', c);
    return m;
};

Phone.prototype.sendUnregister = function() {
    var m = this.createRegister();
    m.setItem('Expires', new sip.Header("0", 'Expires'))
    this._reg.sendRequest(m);
};

Phone.prototype.receivedRegisterResponse = function(ua, response) {
    if (response.isfinal()) {
        if (this.register_state == "registering") {
            if (response.is2xx()) {
                this.setProperty("register_state", "registered");
                this.setProperty("register_button", "Unregister");
                this.setProperty("register_button.disabled", false);
            }
            else {
                this.setProperty("register_state", "not registered");
                this.setProperty("register_button", "Register");
                this.setProperty("register_button.disabled", false);
                this._reg = null;
            }
        }
        else if (this.register_state == "unregistering") {
            this.setProperty("register_state", "not registered");
            this.setProperty("register_button", "Register");
            this.setProperty("register_button.disabled", false);
            this._reg = null;
        }
    }
};

Phone.prototype.sendInvite = function() {
    if (this._call == null) {
        this._call = new sip.UserAgent(this._stack);
        this._call.remoteParty = new sip.Address(this.target_aor);
        this._call.localParty = new sip.Address(this.local_aor);
        if (this.outbound == "proxy") {
            this._call.routeSet = [this.getRouteHeader(this._call.remoteParty.uri.user)];
        }
    } 
    
    this.dispatchMessage("Inviting " + this._call.remoteParty.toString() + " ...");
    
    if (this.network_type == "WebRTC") {
        this.createWebRtcConnection();
    }
    else {
        this.createMediaSockets();
    }
};

Phone.prototype.setVideoProperty = function(videoname, attr, value) {
    if (this.network_type == "WebRTC") {
        log("set " + videoname + "." + attr + " = " + value);
        var obj = $("html5-" + videoname);
        if (obj) {
            if (attr == "controls") {
                obj.controls = value;
            }
            else if (attr == "live" && this.has_html5_webrtc) {
                if (value) {
                    log("local-stream=" + (this._webrtc_local_stream === null));
                    if (this._webrtc_local_stream == null) {
                        var phone = this;
                        try {
                            navigator.webkitGetUserMedia({"video": true, "audio": true},
                                function(stream) { phone.onUserMediaSuccess(stream); },
                                function(error) { phone.onUserMediaError(error); });
                        }
                        catch (e) {
                            // try older style
                            navigator.webkitGetUserMedia("video,audio",
                                function(stream) { phone.onUserMediaSuccess(stream); },
                                function(error) { phone.onUserMediaError(error); });
                        }
                    }
                    else {
                        this.onUserMediaSuccess(this._webrtc_local_stream);
                    }
                }
                else {
                    obj.setAttribute('src', '');
                }
            }
            else {
                log("ignoring set property '" + attr + "' on '" + videoname + '"');
            }
        }
        else {
            log("cannot get video object of id 'html5-" + videoname + "' to set property '" + attr + "'");
        }
    }
    else {
        var obj = getFlashMovie(videoname);
        if (obj) {
            obj.setProperty(attr, value);
        }
        else {
            log("cannot get video object of name '" + videoname + "' to set property '" + attr + "'");
        }
    }
};

Phone.prototype.getVideoProperty = function(videoname, attr) {
    var result = undefined;
    if (this.network_type == "WebRTC") {
        var obj = $("html5-" + videoname);
        if (obj) {
            if (attr == "controls") {
                result = obj.controls;
            }
            else {
                log("ignoring get property '" + attr + "' on '" + videoname + '"');
            }
        }
        else {
            log("cannot get video object of id 'html5-" + videoname + "' to get property '" + attr + "'");
        }
        log("get " + videoname + "." + attr + " = " + result);
    }
    else {
        var obj = getFlashMovie(videoname);
        if (obj) {
            result = obj.getProperty(attr);
        }
        else {
            log("cannot get video object of name '" + videoname + "' to get property '" + attr + "'");
        }
    }
    return result;
};

Phone.prototype.onUserMediaSuccess = function(stream) {
    log("webrtc - accessing user media successfully");
    if (stream !== this._webrtc_local_stream) {
        this._webrtc_local_stream = stream;
        if (this.call_state == "inviting" || this.call_state == "accepting") {
            // need to start peer-connection also
            this.createdWebRtcLocalStream();
        }
    }
    
    var video = $("html5-local-video");
    if (video) {
        var url = webkitURL.createObjectURL(stream);
        log('webrtc - local-video.src="' + url + '"');
        video.setAttribute('src', url);
    }
};

Phone.prototype.onUserMediaError = function(error) {
    log("webrtc - failed to get access to local media: " + error.code);
    var obj = $("local-video-on");
    if (obj) {
        obj.checked = false;
    }
    if (this.call_state == "inviting" || this.call_state == "accepting") {
        if (this.call_state == "accepting") {
            ua.sendResponse(ua.createResponse(603, 'Declined Media Devices'));
        }
        
        this.setProperty("call_state", "failed");
        this.setProperty("call_button.disabled", true);
        this.setProperty("end_button.disabled", false);
        this.dispatchMessage('Failed: cannot access user media devices');
        this.hungup();
    }
};

Phone.prototype.createMediaSockets = function() {
    var this_ = this;
    var handler = function(event) {
        if (event.property == "bound")
            this_.createdMediaSockets();
    };
    
    this._gw = new network.RealTimeGateway();
    this._gw.addEventListener("propertyChange", function(event) {
        if (event.property == "publishurl")
            getFlashMovie('local-video').setProperty('src', event.newValue);
        else if (event.property == "playurl")
            getFlashMovie('remote-video').setProperty('src', event.newValue);
    });
    
    if (this.has_audio || this.has_tones) {
        var as = new network.RealTimeSocket();
        this._rtp.push(as);
        as.addEventListener("propertyChange", handler);
        as.bind();
    }
    if (this.has_video) {
        var vs = new network.RealTimeSocket();
        this._rtp.push(vs);
        vs.addEventListener("propertyChange", handler);
        vs.bind();
    }
    if (this.has_text) {
        var ts = new network.RealTimeSocket();
        this._rtp.push(ts);
        ts.addEventListener("propertyChange", handler);
        ts.bind();
    }
};

Phone.prototype.createdMediaSockets = function() {
    var all = true;
    var streams = [];
    
    for (var i=0; i<this._rtp.length; ++i) {
        if (this._rtp[i].bound == false) {
           all = false;
           break;
        }
    }
    
    if (all) {
        var rtp = this._rtp.slice();
        if (this.has_audio || this.has_tones) {
            var fmt = [];
            if (this.has_audio) {
                fmt.push({pt: 0, name: "pcmu", rate: 8000});
                //fmt.push({pt: 8, name: "pcma", rate: 8000});
                //fmt.push({pt: 96, name: "speex", rate: 8000});
                //fmt.push({pt: 97, name: "speex", rate: 16000});
            }
            if (this.has_tones) {
                fmt.push({pt: 101, name: "telephone-event", rate: 8000});
            }
            var audio = new sip.SDP.media({media: "audio", port: rtp.shift().localPort, proto: "RTP/AVP", fmt: fmt});
            streams.push(audio);
        }
        if (this.has_video) {
            var fmt = [{pt: 100, name: "h264", rate: 90000}];
            var video = new sip.SDP.media({media: "video", port: rtp.shift().localPort, proto: "RTP/AVP", fmt: fmt});
            video['a'] = ['fmtp:100 profile-level-id=42801f;packetization-mode=1'];
            streams.push(video);
        }
        if (this.has_text) {
            var fmt = [{pt: 98, name: "t140", rate: 1000}, {pt: 99, name: "red", rate: 1000}];
            var text = new sip.SDP.media({media: "text", port: rtp.shift().localPort, proto: "RTP/AVP", fmt: fmt});
            text['a'] = ['fmtp:99 98/98/98/98'];
            streams.push(text);
        }
    
        if (this.call_state == "inviting") {
            this._local_sdp = sip.createOffer(streams);
            this._local_sdp['o'].address = this.listen_ip;
            this._local_sdp['c'] = new sip.SDP.connection({address: this.listen_ip});
            
            var m = this._call.createRequest('INVITE');
            var c = new sip.Header(this._stack.uri.toString(), 'Contact');
            c.value.uri.user = this.username;
            m.setItem('Contact', c);
            if (this.user_agent)
                m.setItem('User-Agent', new sip.Header(this.user_agent, 'User-Agent'));
                
            if (this.has_location && this.location) {
                var xml = this.locationToXML(this.location, this.target_value);
                var multipart = this.createMultipartBody('application/sdp', this._local_sdp.toString(), 'application/pidf+xml', xml);
                m.setItem('Content-Type', new sip.Header('multipart/mixed; boundary="' + multipart[0] + '"', 'Content-Type'));
                m.setBody(multipart[1]);
            }
            else {
                m.setItem('Content-Type', new sip.Header('application/sdp', 'Content-Type'));
                m.setBody(this._local_sdp.toString());
            }
        
            this._call.sendRequest(m);
        }
        else if (this.call_state == "accepting") {
            var offer = null
            var ua = this._call;
            
            if (ua.request.hasItem('Content-Type') && ua.request.first('Content-Type').value.toLowerCase() == 'application/sdp') {
                try {
                    offer = new sip.SDP(this._call.request.body);
                } catch (ex) {
                    log("Failed to create SDP: " + ex);
                }
            }
            this._remote_sdp = offer;
            this._local_sdp = sip.createAnswer(streams, offer);
            
            if (this._local_sdp == null) {
                this.dispatchMessage('Incompatible session description');
                ua.sendResponse(ua.createResponse(488, 'Incompatible Session Description'));
                this.setProperty('call_state', 'idle');
                this.hungup();
            }
            else {
                this._local_sdp['o'].address = this.listen_ip;
                this._local_sdp['c'] = new sip.SDP.connection({address: this.listen_ip});
                
                this.createMediaConnections();
                
                this.setProperty('call_state', 'active');
                var m = this._call.createResponse(200, 'OK');
                var c = new sip.Header(this._stack.uri.toString(), 'Contact');
                c.value.uri.user = this.username;
                m.setItem('Contact', c);
                if (this.server)
                    m.setItem('Server', new sip.Header(this.server, 'Server'));
                m.setItem('Content-Type', new sip.Header('application/sdp', 'Content-Type'));
                m.setBody(this._local_sdp.toString());
                this._call.sendResponse(m);
            }
        }
        else {
            log('invalid call state in createdMediaSockets: ' + this.call_state);
        }
    }
};

Phone.prototype.createWebRtcConnection = function() {
    try {
        if ((this.has_audio || this.has_video) && !this.has_html5_webrtc) {
            throw new String("missing WebRTC, cannot use audio or video")
        }
        if (this._webrtc_local_stream == null) {
            this.setVideoProperty("local-video", "live", true);
        }
        else {
            this.createdWebRtcLocalStream();
        }
    }
    catch (e) {
        if (this.call_state == "accepting") {
            ua.sendResponse(ua.createResponse(500, 'Error in getting user media'));
        }
        
        this.setProperty("call_state", "failed");
        this.setProperty("call_button.disabled", true);
        this.setProperty("end_button.disabled", false);
        this.dispatchMessage('Failed: "' + e + '"');
        this.hungup();
    }
};

Phone.prototype.getIceServers = function() {
    var parts = this.webrtc_servers.split(","); // comma separated list
    var result = [];
    for (var i=0; i<parts.length; ++i) {
        var part = parts[i];
        if (part) {
            var index = part.indexOf("|");
            if (index < 0)
                result.push({url: part});
            else
                result.push({url: part.substr(0, index), credential: part.substr(index+1)});
        }
    }
    return result;
};

// extract SDP from the SIP message
Phone.prototype.getSDP = function(message) {
    var type = message.hasItem("Content-Type") ? message.first("Content-Type").value : null;
    return (type == "application/sdp" || message.body) ? message.body : null;
};

Phone.prototype.createdWebRtcLocalStream = function() {
    var phone = this;
    this._webrtc_peer_connection = new webkitRTCPeerConnection({iceServers: this.getIceServers()}, null);
    this._webrtc_peer_connection.onconnecting = function(message) { phone.onWebRtcConnecting(message); };
    this._webrtc_peer_connection.onopen = function(message) { phone.onWebRtcOpen(message) };
    this._webrtc_peer_connection.onaddstream = function(event) { phone.onWebRtcAddStream(event.stream); };
    this._webrtc_peer_connection.onremovestream = function(event) { phone.onWebRtcRemoveStream(); };
    //we use timeout instead of onicecandidate event handler
    //this._webrtc_peer_connection.onicecandidate = function(event) { console.log(event.candidate);};
    if (this.call_state == "accepting" && this._call != null && this._call.request != null) {
        var result = this.getSDP(this._call.request);
        if (result) {
            this._webrtc_peer_connection.setRemoteDescription(new RTCSessionDescription({type: "offer", sdp: result}));
        }
    }
    if (this._webrtc_local_stream != null) {
        this._webrtc_peer_connection.addStream(this._webrtc_local_stream);
    }
    
    if (this.call_state == "inviting") {
        this._webrtc_peer_connection.createOffer(function(offer) {
            phone._webrtc_peer_connection.setLocalDescription(offer);
            setTimeout(function() {
                phone.onWebRtcSendMessage();
            }, phone._sdp_timeout);
        });
    }
    else if (this.call_state == "accepting") {
        this._webrtc_peer_connection.createAnswer(function(offer) {
            phone._webrtc_peer_connection.setLocalDescription(offer);
            setTimeout(function() {
                phone.onWebRtcSendMessage();
            }, phone._sdp_timeout);
        });
    }
};

Phone.prototype.onWebRtcSendMessage = function() {
    if (this.call_state == "inviting") {
        this._local_sdp = this._webrtc_peer_connection.localDescription.sdp;
        var m = this._call.createRequest('INVITE');
        //var c = new sip.Header(this._stack.uri.toString(), 'Contact');
        //c.value.uri.user = this.username;
        var c = new sip.Header((new sip.Address(this.local_aor)).uri.toString(), 'Contact');
        m.setItem('Contact', c);
        if (this.user_agent)
            m.setItem('User-Agent', new sip.Header(this.user_agent, 'User-Agent'));
        m.setItem('Content-Type', new sip.Header("application/sdp", 'Content-Type'));
        m.setBody(this._local_sdp);
        this._call.sendRequest(m);
    }
    else if (this.call_state == "accepting") {
        this._local_sdp = this._webrtc_peer_connection.localDescription.sdp;
        var ua = this._call;
        
        this.setProperty('call_state', 'active');
        this.dispatchMessage('Connected');
        var m = this._call.createResponse(200, 'OK');
        //var c = new sip.Header(this._stack.uri.toString(), 'Contact');
        //c.value.uri.user = this.username;
        var c = new sip.Header((new sip.Address(this.local_aor)).uri.toString(), 'Contact');
        m.setItem('Contact', c);
        if (this.server)
            m.setItem('Server', new sip.Header(this.server, 'Server'));
        m.setItem('Content-Type', new sip.Header("application/sdp", 'Content-Type'));
        m.setBody(this._local_sdp);
        
        this._call.sendResponse(m);
    }
    else if (this.call_state == "active") {
        this._local_sdp = this._webrtc_peer_connection.localDescription.sdp;
        
        // need to send re-INVITE with new SDP
        var ua = this._call;
        
        var m = this._call.createRequest('INVITE');
        //var c = new sip.Header(this._stack.uri.toString(), 'Contact');
        //c.value.uri.user = this.username;
        var c = new sip.Header((new sip.Address(this.local_aor)).uri.toString(), 'Contact');
        m.setItem('Contact', c);
        if (this.user_agent)
            m.setItem('User-Agent', new sip.Header(this.user_agent, 'User-Agent'));
        m.setItem('Content-Type', new sip.Header("application/sdp", 'Content-Type'));
        m.setBody(this._local_sdp);
        this._call.sendRequest(m);
    }
    else {
        log('invalid call state in onWebRtcSendMessage: ' + this.call_state);
    }
};

Phone.prototype.onWebRtcConnecting = function(event) {
    log("webrtc - onconnecting(" + event + ")");
};

Phone.prototype.onWebRtcOpen = function(message) {
    log("webrtc - onopen(" + message + ")");
};

Phone.prototype.onWebRtcAddStream = function(stream) {
    log("webrtc - onaddstream(...)");
    var video = $("html5-remote-video");
    if (video) {
        var url = webkitURL.createObjectURL(stream);
        log('webrtc - remote-video.src="' + url + '"');
        video.setAttribute('src', url);
    }
};

Phone.prototype.onWebRtcRemoveStream = function() {
    log("webrtc - onremovestream()");
    var video = $("html5-remote-video");
    if (video) {
        log("webrtc - remote-video.src=null");
        video.setAttribute('src', '');
    }
};

Phone.prototype.hungup = function() {
    if (this._call != null) {
        this._call = null;
    }
    if (this.network_type == "WebRTC") {
        var local = $("html5-local-video");
        if (local) {
            local.setAttribute('src', '');
        }
        var remote = $("html5-remote-video");
        if (remote) {
            remote.setAttribute('src', '');
        }
        if (this._webrtc_peer_connection) {
            try {
                this._webrtc_peer_connection.close();
            }
            catch (error) {
                log("webrtc - error closing peer connection: " + error);
            }
            this._webrtc_peer_connection = null;
        }
    }
    else {
        getFlashMovie("local-video").setProperty("src", null);
        getFlashMovie("remote-video").setProperty("src", null);
        if (this._gw != null) {
            this._gw.close();
            this._gw = null;
        }
        if (this._rtp && this._rtp.length > 0) {
            for (var i=0; i<this._rtp.length; ++i) {
                this._rtp[i].close();
            }
            this._rtp.splice(0, this._rtp.length);
        }
    }
    this._local_sdp = null;
    this._remote_sdp = null;
}

Phone.prototype.getRouteHeader = function(username) {
    return new sip.Header("<sip:" + (username ? username + "@" : "") + this.outbound_proxy_address + ";lr>", 'Route');
};

Phone.prototype.receivedInviteResponse = function(ua, response) {
    if (response.isfinal()) {
        if (!response.is2xx()) {
            if (this.call_state == "inviting" || this.call_state == "ringback") {
                this.setProperty("call_state", "failed");
                this.setProperty("call_button.disabled", true);
                this.setProperty("end_button.disabled", false);
                this.dispatchMessage('Failed: "' + response.response + ' ' + response.responsetext + '"');
                this.hungup();
            }
        }
        else {
            if (this.network_type == "WebRTC") {
                if (this._webrtc_peer_connection) {
                    ua.autoack = true;
                    if (this.call_state == "inviting" || this.call_state == "ringback") {
                        this.setProperty("call_state", "active");
                        this.dispatchMessage('Connected');
                        
                        var result = this.getSDP(response);
                        if (result) {
                            this._webrtc_peer_connection.setRemoteDescription(new RTCSessionDescription({type: "answer", sdp: result}));
                        }
                    }
                }
                else {
                    // failed to get peer-connection
                    this.setProperty("call_state", "failed");
                    this.sendBye();
                    this.dispatchMessage("No peer connection found");
                }
            }
            else {
                if (response.hasItem('Content-Type') && response.first('Content-Type').value.toLowerCase() == 'application/sdp') {
                    var answer = new sip.SDP(response.body);
                    this._remote_sdp = answer;
                    this.createMediaConnections();
                    
                    if (this.call_state != 'active') {
                        this.setProperty("call_state", "active");
                        this.dispatchMessage('Connected');
                    }
                }
                else {
                    // failed to get SDP
                    this.dispatchMessage("Missing session description");
                    this.sendBye();
                    this.setProperty("call_state", "failed");
                }
            }
        }
    }
    else if (response.is1xx()) {
        if (response.response != 100) {
            this.dispatchMessage('Progress "' + response.response + ' ' + response.responsetext + '"');
            if (response.response >= 180) {
                this.setProperty("call_state", "ringback");
                this.playSound("ringback");
            }
        }
    }
};

Phone.prototype.receivedAck = function(ua, request) {
    if (this.network_type == "WebRTC") {
        if (this._webrtc_peer_connection) {
            // do not handle SDP in ACK
        }
    }
};


Phone.prototype.createMediaConnections = function() {
    log('create media connections');
    var rtp = this._rtp.slice();
    var audio_sock = null, video_sock = null;
    
    // TODO: need to dynamically create receive and send types
    if (this.has_audio || this.has_tones) {
        log('setting gateway audio');
        audio_sock = rtp.shift();
        this._gw.setAudio(audio_sock, {0: 'pcmu/8000'}, {'pcmu/8000': 0});
    }
    if (this.has_video) {
        log('setting gateway video');
        video_sock = rtp.shift();
        this._gw.setVideo(video_sock, {100: 'h264/90000'}, {'h264/90000': 100});
    }
    
    var media = this._remote_sdp['m'];
    var conn = this._remote_sdp['c'];
    for (var i=0; i<media.length; ++i) {
        var m = media[i];
        var address = m['c'] ? m['c'].address : conn.address;
        if (m.media == 'audio' && audio_sock) {
            if (m.port) {
                audio_sock.connect(address, m.port);
            }
        }
        else if (m.media == 'video' && video_sock) {
            if (m.port) {
                video_sock.connect(address, m.port);
            }
        }
    }
};

Phone.prototype.playSound = function(value) {
    if (this.enable_sound_alert) {
        var audio = $("html5-audio");
        if (audio) {
            // TODO: use .ogg for chrome/firefox/opera and .mp3 for IE/safari
            audio.setAttribute('src',(value ? value + ".ogg" : value));
        }
    }
};

Phone.prototype.receivedInvite = function(ua, request) {
    if (this.call_state == "idle") {
        this._call = ua;
        this.setProperty("call_state", "incoming");
        this.setProperty("call_button.disabled", false);
        this.setProperty("end_button.disabled", false);
        var from = request.first('From').value;
        this.setProperty("target_value", from.uri.user + '@' + from.uri.host);
        this.dispatchMessage('Incoming call from ' + from.toString());
        ua.sendResponse(ua.createResponse(180, 'Ringing'));
        this.playSound("ringing");
    }
    else if (this.call_state == "active" && this._call == ua) {
        // received re-invite
        log("received re-INVITE");
        var m = this._call.createResponse(200, 'OK');
        //var c = new sip.Header(this._stack.uri.toString(), 'Contact');
        //c.value.uri.user = this.username;
        var c = new sip.Header((new sip.Address(this.local_aor)).uri.toString(), 'Contact');
        m.setItem('Contact', c);
        if (this.server)
            m.setItem('Server', new sip.Header(this.server, 'Server'));
        this._call.sendResponse(m);
        
        if (this._webrtc_peer_connection) {
            var result = this.getSDP(request);
            if (result) {
                this._webrtc_peer_connection.setRemoteDescription(new RTCSessionDescription({type: "offer", sdp: result}));
            }
        }
    }
    else {
        log("received INVITE in state " + this.call_state);
        var from = request.first('From').value;
        this.dispatchMessage('Missed call from ' + from.toString());
        ua.sendResponse(ua.createResponse(486, 'Busy Here'));
        this.playSound("alert");
    }
};

Phone.prototype.sendInviteResponse = function(code, text) {
    if (this._call) {
        if (code >= 200 && code < 300) {
            this.setProperty("call_state", "accepting");
            if (this.network_type == "WebRTC") {
                this.createWebRtcConnection();
            }
            else {
                this.createMediaSockets();
            }
        }
        else if (code >= 300) {
            this._call.sendResponse(this._call.createResponse(code, text));
            this.setProperty("call_state", "idle");
            this.hungup();
        }
    }
};

Phone.prototype.sendBye = function() {
    if (this._call) {
        var m = this._call.createRequest('BYE');
        this._call.sendRequest(m);
        this.hungup();
    }
};

Phone.prototype.receivedBye = function(ua, request) {
    if (this._call && this.call_state != "idle") {
        ua.sendResponse(ua.createResponse(200, 'OK'));
        this.dispatchMessage('Call closed by remote party');
        this.setProperty("call_state", "closed");
        this.setProperty("call_button.disabled", true);
        this.setProperty("end_button.disabled", false);
//        this.hungup();
    }
};

Phone.prototype.receivedByeResponse = function(ua, response) {
    log("ignoring BYE response: " + response.response + " " + response.responsetext);
}

Phone.prototype.sendCancel = function() {
    if (this._call) {
        this._call.sendCancel();
        this.setProperty("call_state", "idle");
        this.hungup();
    }
};



Phone.prototype.dispatchMessage = function(text, sender) {
    this.dispatchEvent({"type": "message", "text": text, "sender": sender});
};

Phone.prototype.sendMessage = function(text, ua) {
    if (ua === undefined) {
        ua = new sip.UserAgent(this._stack);
        ua.remoteParty = new sip.Address(this.target_aor);
        ua.localParty = new sip.Address(this.local_aor);
        if (this.outbound == "proxy") {
            ua.routeSet = [this.getRouteHeader(ua.remoteParty.uri.user)];
        }
    }
    
    this.dispatchMessage(text, this.displayname + " (you)");
    var m = ua.createRequest('MESSAGE');
    m.setItem('Content-Type', new sip.Header("text/plain", "Content-Type"));
    m.setBody(text);
    ua.sendRequest(m);
};

Phone.prototype.receivedMessageResponse = function(ua, response) {
    if (response.isfinal()) {
        if (!response.is2xx()) {
            this.dispatchMessage('Failed: "' + response.response + ' ' + response.responsetext + '"');
        }
    }
};

Phone.prototype.receivedMessage = function(ua, request) {
    log("received message");
    ua.sendResponse(ua.createResponse(200, 'OK'));
    
    var text, sender;
    if (request.hasItem("Content-Type") && request.first("Content-Type").value == "text/plain") {
        text = request.body;
    }
    sender = request.first("From").value.getDisplayable();
    if (text && sender) {
        this.dispatchMessage(text, sender);
        this.playSound("alert");
    }
    
    if (this.call_state == "idle") {
        var from = request.first("From").value;
        this.setProperty("target_scheme", from.uri.scheme);
        this.setProperty("target_value", from.uri.user + "@" + from.uri.host);
    }
};

Phone.prototype.onSockData = function(event) {
    log("<= " + event.srcAddress + ":" + event.srcPort + "\n" + event.data);
    this._stack.received(event.data, [event.srcAddress, event.srcPort]);
};

Phone.prototype.onSockError = function(event) {
    // do not use event to mean Flash Network's event
    this._sock = null;
    this.setProperty("sock_state", "idle");
    this.setProperty("register_state", "not registered");
    this._reg = null;
    this.setProperty("register_button", "Register");
    this.setProperty("register_button.disabled", true);
    this.setProperty("call_state", "idle");
    this.hungup();
};

Phone.prototype.onWebSocketOpen = function() {
    log("websocket connected");
    this.onSockPropertyChange({"property": "connected", "oldValue": false, "newValue": true});
};

Phone.prototype.onWebSocketClose = function() {
    this.onSockPropertyChange({"property": "connected", "oldValue": true, "newValue": false});
};

Phone.prototype.onWebSocketError = function(error) {
    this.onSockError({"code": "websocket-error", "reason": error});
};

Phone.prototype.onWebSocketMessage = function(msg) {
    this.onSockData({"data": msg.data, "srcPort": 0, "srcAddress": "127.0.0.1"});
};

Phone.prototype.createServer = function(request, uri, stack) {
    log("Phone.createServer() for method=" + request.method);
    return (request.method != "CANCEL" ? new sip.UserAgent(this._stack, request) : null);
};

Phone.prototype.receivedRequest = function(ua, request, stack) {
    var method = request.method;
    log("Phone.receivedRequest() " + request.method);
    if (method == "INVITE") {
        this.receivedInvite(ua, request);
    }
    else if (method == "BYE") {
        this.receivedBye(ua, request);
    }
    else if (method == "MESSAGE") {
        this.receivedMessage(ua, request);
    }
    else if (method == "ACK") {
        this.receivedAck(ua, request);
    }
    else {
        log("ignoring received request method=" + method);
        if (method != 'ACK') 
            ua.sendResponse(ua.createResponse(501, "Not Implemented"));
    }
};

Phone.prototype.receivedResponse = function(ua, response, stack) {
    var method = ua.request.method;
    if (method == 'REGISTER') {
        this.receivedRegisterResponse(ua, response);
    }
    else if (method == "INVITE") {
        this.receivedInviteResponse(ua, response);
    }
    else if (method == "BYE") {
        this.receivedByeResponse(ua, response);
    }
    else if (method == "MESSAGE") {
        this.receivedMessageResponse(ua, response);
    }
    else {
        log("ignoring response for method=" + method);
    }
};

Phone.prototype.cancelled = function(ua, request, stack) {
    log("cancelled");
    if (this._call && this.call_state == "incoming") {
        if (ua == this._call) {
            this.dispatchMessage("Incoming call cancelled");
            this.setProperty("call_state", "idle");
            this.hungup();
        }
        else {
            log("invalid ua for cancel");
        }
    }
};

Phone.prototype.dialogCreated = function(dialog, ua, stack) {
    log("dialog created");
    if (ua == this._call) {
        this._call = dialog;
    }
};

Phone.prototype.authenticate = function(ua, header, stack) {
    log("phone.authenticate() called");
    header.username = $('authname').value;
    header.password = $('password').value;
    return true;
};

Phone.prototype.createTimer = function(obj, stack) {
    return new sip.TimerImpl(obj);
};

Phone.prototype.resolve = function(host, type, callback, stack) {
    var resolver = new network.DNSResolver();
    resolver.addEventListener("error", function(event) {
        log("cannot resolve DNS host " + host + " type " + type);
        callback(host, []); 
    });
    resolver.addEventListener("lookup", function(event) {
        log("resolved DNS host " + event.host + " length=" + event.resourceRecords.length);
        callback(host, event.resourceRecords);
    });
    resolver.resolve(host, type);
};

Phone.prototype.send = function(data, addr, stack) {
    log("=> " + addr[0] + ":" + addr[1] + "\n" + data);
    this._sock.send(data, addr[0], addr[1]);
};

Phone.prototype.sendDigit = function(digit) {
    if (this.call_state == "idle") {
        if (this.target_scheme != "tel") {
            this.setProperty("target_scheme", "tel");
            this.setProperty("target_value", "");
        }
        this.setProperty("target_value", (this.target_value || "") + digit);
    }
    else {
        // send the digit as RFC 4733.
        log("sending digit in a call is not implemented");
    }
};

Phone.prototype.sendChar = function(event) {
    //log("send char " + event.keyCode + " " + String.fromCharCode(event.keyCode));
};

Phone.prototype.sendText = function(text) {
    if (this.call_state == "active") {
        log("send session text " + text);
        if (this.has_text) {
            // send using real-time text
            log("sending using real-time text is not implemented");
        }
        else {
            // send using SIP MESSAGE
            this.sendMessage(text, this._call);
        }
    }
    else {
        log("send paging text " + text);
        if (!this._sock) {
            this._next_message = text;
            this.createSocket();
        }
        else {
            this.sendMessage(text);
        }
    }
};

Phone.prototype.setLocation = function() {
    var location = prompt("Enter your civic location or geodatic co-ordinates\nFor example,  \"40.8097 -73.9608\" or\n\"A1=US,A2=CA,A3=San Francisco,HNO=542,RD=5th,STS=Ave\"");
    this.setProperty("location", location);
};

Phone.prototype.locationToXML = function(location, userhost) {
    var geo = /^([\d\.\-]+)\s+([\d\.\-]+)(\s+([\d\.]+))?$/;
    var match = location.match(geo);
    var result = null;
    if (match) {
        var latitude = match[1], longitude = match[2], radius = match[4];
        if (radius) {
            result = '<location id="location0" profile="geodetic-2d"><Circle id="point0" xmlns="http://www.opengis.net/pidflo/1.0" srsName="urn:ogc:def:crs:EPSG::4326"><pos xmlns="http://www.opengis.net/gml">' + latitude + ' ' + longitude + '</pos><radius  uom="urn:ogc:def:uom:EPSG::9001">' + radius + '</radius></Circle></location>';
        }
        else {
            result = '<location id="location0" profile="geodetic-2d"><Point id="point0" xmlns="http://www.opengis.net/gml" srsName="urn:ogc:def:crs:EPSG::4326"><pos>' + latitude + ' ' + longitude + '</pos><radius uom="urn:ogc:def:uom:EPSG::9001">' + radius + '</radius></Point></location>';
        }
    }
    else {
        var parts = location.split(',');
        var attrs = [];
        for (var i=0; i<parts.length; ++i) {
            var part = parts[i];
            var index = part.indexOf('=');
            if (index > 0) {
                var aname = part.substr(0, index), avalue = part.substr(index+1);
                attrs.push('<' + aname + '>' + avalue + '</' + aname + '>');
            }
        }
        result = '<location id="location0" profile="civic"><civicAddress xmlns="urn:ietf:params:xml:ns:pidf:geopriv10:civicAddr">' + attrs.join('') + '</civicAddress></location>';
    }
    
    return '<presence entity="pres:' + userhost + '" xmlns="urn:ietf:params:xml:ns:pidf"><tuple><status><geopriv xmlns="urn:ietf:params:xml:ns:pidf:geopriv10"><location-info>' + result + '</location-info></geopriv></status></tuple></presence>';
};

// must have even number of arguments: type, content, type, content, ...
Phone.prototype.createMultipartBody = function() {
    var boundary = "boundary-" + Math.floor(Math.random() * 1000000000);
    var parts = [];
    for (var i=0; i<arguments.length; i+=2) {
        var type = arguments[i];
        var content = arguments[i+1];
        parts.push('Content-Type: ' + type + '\r\n\r\n' + content);
    }
    var multipart = '--' + boundary + '\r\n' + parts.join('\r\n--' + boundary + '\r\n') + '\r\n--' + boundary + '--';
    return [boundary, multipart];
};

Phone.prototype.print = function(content) {
    content = cleanHTML(content).replace(/\n/g, "<br/>\n");
    var docprint = window.open("", "", "toolbar=yes,location=no,directories=no,menubar=no,scrollbars=yes,width=650,height=600,left=100,top=25");
    docprint.document.open();
    docprint.document.write('<html><head><title>Program Log</title>');
    docprint.document.write('</head><body onLoad="self.print()">');
    docprint.document.write(content);
    docprint.document.write('</body></html>');
    docprint.document.close(); 
    docprint.focus(); 
};

Phone.prototype.toggleControls = function(name) {
    try {
        this.setVideoProperty(name, 'controls', !this.getVideoProperty(name, 'controls'));
        //var obj = getFlashMovie(name);
        //var controls = obj.getProperty('controls');
        //obj.setProperty('controls', !controls);
        return false;
    }
    catch (ex) {
        log(ex.stack);
    }
};

Phone.prototype.help = function(name) {
    var text = null;
    if (name == "default") {
        text = 'This web-based phone allows you to register with a server, and make or receive VoIP calls from web. This is a demonstration of the <a href="http://code.google.com/p/sip-js">SIP in Javascript</a> project.<br/><br/>'
        + 'Please click on help <a href="#" onclick="return help(\'default\');"><img src="help.png"></img></a> anywhere on this page to learn how to use that part of the web phone.<br/><br/>'
        + 'Additionally, the edit <img src="edit.png"></img> and save <img src="save.png"></img> buttons allow you to edit and save certain configuration properties in that box.The buttons and controls are enabled only when they make sense in a particular system state.<br/><br/>'
        + 'Once you reach this page, the Flash Network application kicks in to launch the separate application that assists this page in network activity. The first time initialization includes installation and launch of the <a href="http://theintencity.com/flash-network" target="_blank">Flash Network</a> application. Once the initialization is complete and the <input href="#" value="Register" type="button" class="button" disabled="disabled"/> and <input href="#" value="Call" type="button" class="button" disabled="disabled"/> buttons are enabled, you can proceed with using this web phone. All the controls except Flash Network are disabled until the initialization is complete.';
    }
    else if (name == "configuration") {
        text = 'Click on the edit <img src="edit.png"></img> button in the Configuration box to enable the configuration controls. Type the values in various edit boxes to set the configuration properties. This must be done before clicking on the <input type="button" class="button" value="Register"/> or <input type="button" class="callbutton" value="Call"/> button for that function to use the correct configuration properties.<br/><br/>'
        + 'You may use your full name as the display name. The user name and domain are provided by your VoIP provider, and are used to define your address-of-record such as sip:myname@iptel.org. The auth name and password are used for registration as well as for password authenticated outbound calls. Usually the auth name is same as your user name. We prefer to use the UDP transport, but occassionally you may need to use TCP. The WS transport indicates emerging WebSocket for SIP signaling transport while using WebRTC for media path.<br/><br/>'
        + 'The features that are not yet implemented are not enabled, e.g., TCP and WS are future work.';
    }
    else if (name == "register") {
        text = 'To register (login) with your VoIP service provider, enter the configuration properties and the registration properties, and click on <input type="button" class="button" value="Register"/>. You need to click on the edit <img src="edit.png"></img> button in the Register box to enable the registration properties controls. The registration properties are as follows.<br/><br/>The outbound messages can be sent via the target domain or a specific proxy address. The registration interval should be small for web phone such as 3 minutes, i.e., 180 seconds. The "rport" feature allows traversal across NAT boundaries for responses over UDP transport. The "sip-outbound" feature allows traversal across NAT boundaries for incoming requests over UDP and TCP transport. The AoR (address-of-record) is automatically updated when you change the configuration parameters. There are two status indications, first for listening SIP socket and second for registration. The registration status indicates the current status of your login, e.g., "registered" or "not registered".<br/><br/>'
        + 'The features that are not yet implemented are not enabled, e.g., sip-outbound is future work, rport is always enabled, and AoR is read-only based on your Configuration properties.';
    }
    else if (name == "call") {
        text = 'To make an outbound call, enter the target destination address such as "kundan@iptel.org" and click on the <input type="button" class="callbutton" value="Call"/> button. To close a call, cancel an outbound invitation or reject an incoming call, click on the <input type="button" class="endbutton" value="End"/> button. These buttons are enabled depending on the call and system state. The call state is displayed on the bottom left corner of this box, e.g., "idle", "inviting", "incoming", "active", "failed" or "closed".<br/><br/>'
        + 'When you receive an incoming call, the call status changes to "incoming" and you can click on the <input type="button" class="callbutton" value="Call"/> button to answer or the <input type="button" class="endbutton" value="End"/> button to decline the call invitation. The caller address is populated in the target destination address for an incoming call.<br/><br/>'
        + 'To do a self test call, just set your target destination to correspond to your own user name and domain configuration parameters and click on the Call button. This is useful for testing the call signaling and media flow in a loopback mode.<br/><br/>'
        + 'To dial a phone number or urn address, click on "sip:" to select the correct target address scheme. If you use the dial-pad to enter the target number, the scheme is automatically changed to "tel:"<br/><br/>'
        + 'You do not need to register, to make an outbound call. But without registering you will not be able to receive an incoming call, unless the caller dials your dynamic IP and port directly.<br/><br/>'
        + 'Click on the edit <img src="edit.png"></img> button in the Call box to enable the media capabilities of the call. Default is to select audio and video, but this allows you to make an audio-only call. The features that are not yet implemented are not enabled, e.g., Text, Tones and Location are for future work.';
    }
    else if (name == "im") {
        text = 'To send a text message simple type your text message in the edit box in the bottom left corner, and press enter or click on the <input type="button" class="button" value="Send"/> button. The text chat history including sent and received message as well as any call related system messages are shown in the text area above.<br/><br/>'
        + 'The outbound text message is sent to the target destination address of the Call box if you are not in a call, and is sent to the remote party if you are in a call. Thus, if you are in a call, then changing the target destination address does not change the text message target. For incoming message outside a call, the target destination address is updated with the source of the received text message.<br/><br/>'
        + 'Click on the print <img src="print.png"></img> button to print this history.';
    }
    else if (name == "local-video") {
        text = 'This area displays your camera view in a video call. It uses the external <a href="http://code.google.com/p/flash-videoio" target="_blank">Flash VideoIO</a> project to facilitate audio and video device capture. You may click on the check box <input type="checkbox"/> to toggle your camera view independent of a video call. You may click on the edit <img src="edit.png"></img> button to enable or disable the VideoIO\'s control panel in the video display.';
    }
    else if (name == "remote-video") {
        text = 'This area displays the received video view in a video call. It uses the external <a href="http://code.google.com/p/flash-videoio" target="_blank">Flash VideoIO</a> project to facilitate audio and video playback and display. You may click on the edit <img src="edit.png"></img> button to enable or disable the VideoIO\'s control panel in the video display.';
    }
    else if (name == "flash-network") {
        text = 'This area shows the <a href="http://theintencity.com/flash-network" target="_blank">Flash Network</a> activities including the first time initialization prompts, the authentication prompts and any network status. It also displays the selected local IP address that is used for your phone. For most of the prompts, you will follow the standard Flash Network <a href="http://theintencity.com/flash-network/userguide.html" target="_blank">user guide</a>.<br/><br/>'
        + 'For changing the selected local IP address, click on the <img src="edit.png"></img> button and enter the new IP address. This must be done before the SIP listening socket is created. The SIP listening socket is created the first time you click on Register or Call button.<br/><br/>'
        + 'For trying out the experimental WebRTC technology that uses WebSocket for signaling, click on the change link in the title and confirm the changed launch when prompted. Alternatively, you can use the <tt>?network_type=WebRTC</tt> URL parameter on this page to launch with WebRTC and WebSocket support. In the WebRTC mode it connects using WebSocket for signaling and WebRTC for media path. You can change the WebSocket URL\' path and WebRTC peer connection\' configuration in this box. The configuration is a optional comma separated list of STUN or TURN servers with optional credentials, e.g., "stun://host1,turn://host2|mypass"' ;
    }
    else if (name == "program-log") {
        text = 'This area displays the debug trace for the software including all the necessary SIP messages that are needed for debugging any problems. To report any issues, please attach your full program log. You can click on the check box <input type="checkbox" checked="checked"/> to toggle the auto-scroll mode of this view. Click on the <img src="print.png"></img> button to print the full program log.';
    }
    if (!text)
        text = 'Help text for this feature is not written';
    $("help").innerHTML = text;
    return false;
};
