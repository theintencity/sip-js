var phone = null;

window.onload = function() {
    
    document.body.setAttribute("is_app", is_app);
    
    // load flash-network related scripts
    if (!is_app) {
        var script1 = document.createElement("script");
        script1.setAttribute("type", "text/javascript");
        script1.setAttribute("src", "http://theintencity.kundansingh.com/flash-network/swfobject.js");
        document.head.appendChild(script1);
        
        var script2 = document.createElement("script");
        script2.setAttribute("type", "text/javascript");
        script2.setAttribute("src", "http://theintencity.kundansingh.com/flash-network/json2.js");
        document.head.appendChild(script2);
        
        var script3 = document.createElement("script");
        script3.setAttribute("type", "text/javascript");
        script3.setAttribute("src", "http://theintencity.kundansingh.com/flash-network/flash-network.js");
        document.head.appendChild(script3);
    }

    // moved inline scripts from phone.html
    $("config-box-save").addEventListener("click", function(event) {
        return phone.enableBox('config', false);
    });
    $("config-box-edit").addEventListener("click", function(event) {
        return phone.enableBox('config', true);
    });
    $("config-box-help").addEventListener("click", function(event) {
        return phone.help('configuration', false);
    });
    $("displayname").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('displayname', $('displayname').value); }, 100);
    });
    $("username").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('username', $('username').value); }, 100);
    });
    $("domain").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('domain', $('domain').value); }, 100);
    });
    $("authname").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('authname', $('authname').value); }, 100);
    });
    $("password").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('password', $('password').value); }, 100);
    });
    $("transport_udp").addEventListener("click", function(event) {
        phone.setProperty('transport', 'udp')
    });
    $("transport_tcp").addEventListener("click", function(event) {
        phone.setProperty('transport', 'tcp');
    });
    $("transport_ws").addEventListener("click", function(event) {
        phone.setProperty('transport', 'ws');
    });
    
    
    $("register-box-save").addEventListener("click", function(event) {
        return phone.enableBox('register', false);
    });
    $("register-box-edit").addEventListener("click", function(event) {
        return phone.enableBox('register', true);
    });
    $("register-box-help").addEventListener("click", function(event) {
        return phone.help('register', false);
    });
    //$("outbound_domain").addEventListener("click", function(event) {
    //    phone.setProperty('outbound', 'domain');
    //});
    $("outbound_target").addEventListener("click", function(event) {
        phone.setProperty('outbound', 'target');
    });
    $("outbound_proxy").addEventListener("click", function(event) {
        phone.setProperty('outbound', 'proxy');
    });
    $("outbound_proxy_address").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('outbound_proxy_address', $('outbound_proxy_address').value); }, 100);
    });
    $("register_interval").addEventListener("click", function(event) {
        phone.setProperty('register_interval', parseInt($('register_interval')).value);
    });
    $("rport").addEventListener("click", function(event) {
        phone.setProperty('rport', $('rport').checked);
    });
    $("sipoutbound").addEventListener("click", function(event) {
        phone.setProperty('sipoutbound', $('sipoutbound').checked);
    });
    $("register_button").addEventListener("click", function(event) {
        return phone.register();
    });
    
    $("call-box-save").addEventListener("click", function(event) {
        return phone.enableBox('call', false);
    });
    $("call-box-edit").addEventListener("click", function(event) {
        return phone.enableBox('call', true);
    });
    $("call-box-help").addEventListener("click", function(event) {
        return phone.help('call', false);
    });
    
    
    $("target_scheme").addEventListener("change", function(event) {
        phone.setProperty('target_scheme', ['sip', 'tel', 'urn'][$('target_scheme').selectedIndex]);
    });
    $("target_value").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('target_value', $('target_value').value) }, 100);
    });
    $("dialpad1").addEventListener("click", function(event) {
        phone.sendDigit('1');
    });
    $("dialpad2").addEventListener("click", function(event) {
        phone.sendDigit('2');
    });
    $("dialpad3").addEventListener("click", function(event) {
        phone.sendDigit('3');
    });
    $("dialpad4").addEventListener("click", function(event) {
        phone.sendDigit('4');
    });
    $("dialpad5").addEventListener("click", function(event) {
        phone.sendDigit('5');
    });
    $("dialpad6").addEventListener("click", function(event) {
        phone.sendDigit('6');
    });
    $("dialpad7").addEventListener("click", function(event) {
        phone.sendDigit('7');
    });
    $("dialpad8").addEventListener("click", function(event) {
        phone.sendDigit('8');
    });
    $("dialpad9").addEventListener("click", function(event) {
        phone.sendDigit('9');
    });
    $("dialpadstar").addEventListener("click", function(event) {
        phone.sendDigit('*');
    });
    $("dialpad0").addEventListener("click", function(event) {
        phone.sendDigit('1');
    });
    $("dialpadhash").addEventListener("click", function(event) {
        phone.sendDigit('#');
    });
    $("call_button").addEventListener("click", function(event) {
        return phone.call();
    });
    $("end_button").addEventListener("click", function(event) {
        return phone.end();
    });
    $("has_audio").addEventListener("click", function(event) {
        phone.setProperty('has_audio', $('has_audio').checked);
    });
    $("has_tones").addEventListener("click", function(event) {
        phone.setProperty('has_tones', $('has_tones').checked);
    });
    $("has_video").addEventListener("click", function(event) {
        phone.setProperty('has_video', $('has_video').checked);
    });
    $("has_text").addEventListener("click", function(event) {
        phone.setProperty('has_text', $('has_text').checked);
    });
    $("has_location").addEventListener("click", function(event) {
        phone.setProperty('has_location', $('has_location').checked);
    });
    $("set-location").addEventListener("click", function(event) {
        phone.setLocation();
    });

    $("im-box-print").addEventListener("click", function(event) {
        return phone.print($('im-history').value);
    });
    $("im-box-help").addEventListener("click", function(event) {
        return phone.help('im', false);
    });
    $("im-input").addEventListener("keypress", function(event) {
        return phone.sendChar(event);
    });
    $("im-input").addEventListener("change", function(event) {
        phone.sendText($('im-input').value);
        $('im-input').value='';
        return false;
    });
    $("im-button").addEventListener("click", function(event) {
        phone.sendText($('im-input').value);
        $('im-input').value='';
        return false;
    });

    $("local-video-box-toggle").addEventListener("click", function(event) {
        return phone.toggleControls('local-video');
    });
    $("local-video-box-help").addEventListener("click", function(event) {
        return phone.help('local-video', false);
    });
    $("local-video-on").addEventListener("click", function(event) {
        phone.setVideoProperty('local-video', 'live', $('local-video-on').checked);
    });
    if (!is_app) {
        $("local-video-alt").innerHTML = '<a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a>';
    }

    $("remote-video-box-toggle").addEventListener("click", function(event) {
        phone.setVideoProperty('remote-video', 'controls', !phone.getVideoProperty('remote-video', 'controls'));
        return false;
    });
    $("remote-video-box-help").addEventListener("click", function(event) {
        return phone.help('remote-video', false);
    });
    if (!is_app) {
        $("remote-video-alt").innerHTML = '<a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a>';
    }

    
    $("flash-network-box-save").addEventListener("click", function(event) {
        return phone.enableBox('network', false);
    });
    $("flash-network-box-edit").addEventListener("click", function(event) {
        return phone.enableBox('network', true);
    });
    $("flash-network-box-help").addEventListener("click", function(event) {
        return phone.help('flash-network', false);
    });
    if (!is_app) {
        $("flash-network-alt").innerHTML = '<a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a>';
    }
    $("flash-network-box-change-type").addEventListener("click", function(event) {
        phone.changeNetworkType();
    });
    $("listen_ip").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('listen_ip', $('listen_ip').value); }, 100);
    });
        
    $("websocket_path").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('websocket_path', $('websocket_path').value); }, 100);
    });
    $("enable_sound_alert").addEventListener("click", function(event) {
        phone.setProperty('enable_sound_alert', $('enable_sound_alert').checked);
    });
    $("webrtc_servers").addEventListener("keypress", function(event) {
        setTimeout(function() { phone.setProperty('webrtc_servers', $('webrtc_servers').value); }, 100);
    });
    
    $("help-box-help").addEventListener("click", function(event) {
        return phone.help('default');
    });

    $("log_scroll").addEventListener("click", function(event) {
        phone.setProperty('log_scroll', $('log_scroll').checked);
    });
    $("log-box-print").addEventListener("click", function(event) {
        return phone.print($('log-text').value);
    });
    $("log-box-help").addEventListener("click", function(event) {
        return phone.help('program-log');
    });

    // moved script from phone.html
    
    phone = new Phone();
    
    if (!is_app) {
        setTimeout(function() {
            try {
                //network._debug = true;
                network.onstatus = function(value) { phone.statusChanged(value); };
                network.onnetworkchange = function() { phone.networkChanged(); };
            } catch (e) {
                // ignore if network is undefined
            }
        }, 500);
    } else {
        phone.setProperty("network_type", "WebRTC");
    }
    
    phone.addEventListener("propertyChange", function(event) {
        var value = event.newValue;
        var property = event.property;
        var subprop = "";
        if (property.indexOf(".") >= 0) {
            var parts = property.split(".");
            property = parts[0];
            if (parts.length > 0)
                subprop = parts[1];
        }
        
        var input = $(property);
        if (!input) {
            var inputs = document.getElementsByName(property);
            // this may be radio buttons.
            for (var j=0; j<inputs.length; ++j) {
                var input1 = inputs[j];
                if (subprop) {
                    input1[subprop] = value;
                }
                else if (input1.value == value) {
                    input = input1;
                    input.checked = true;
                    break;
                }
            }
        }
        else {
            if (input.localName == "input") {
                if (input.type == "text" || input.type == "password" || input.type == "button") {
                    if (subprop)
                        input[subprop] = value;
                    else
                        input.value = value;
                }
                else if (input.type == "checkbox") {
                    if (subprop)
                        input[subprop] = value;
                    else
                        input.checked = (value && value != "false" ? true : false);
                }
                else if (input.type == "radio") {
                    if (subprop) {
                        input[subprop] = value;
                    }
                }
            }
            else if (input.localName == "span" || input.localName == "div") {
                if (!subprop)
                    input.innerHTML = cleanHTML(value);
            }
            else if (input.localName == "select") {
                if (subprop)
                    input[subprop] = value;
                else
                    input.value = value;
            }
            else {
                log("ignoring propertyChange for " + event.property);
            }
        }
    });
    
    phone.addEventListener("message", function(event) {
        var msg = "";
        if (event.sender) {
            msg += event.sender + ": ";
        }
        if (event.text) {
            msg += event.text;
        }
        if (msg) {
            var history = $('im-history');
            history.value += "\n" + msg;
            history.scrollTop = history.scrollHeight;
        }
    });
    
    phone.populate();
    phone.help("default");
    
    if (!is_app && phone.network_type != "WebRTC") {
        setTimeout(function() {
            swfobject.embedSWF("http://theintencity.kundansingh.com/flash-network/NetworkIO.swf", "flash-network", "215", "138", "10.0.0", "http://theintencity.kundansingh.com/flash-network/expressInstall.swf", 
                {"apiVersion": "1.0", "prefix": "network."}, 
                {"allowScriptAccess": "always", "bgcolor" : "#f0f0f0"}, 
                {"id": "flash-network", "name": "flash-network"});
            network.movieName = "flash-network";
      
            swfobject.embedSWF("http://theintencity.kundansingh.com/flash-network/VideoIO11.swf", "local-video", "240", "168", "11.0.0", "http://theintencity.kundansingh.com/flash-network/expressInstall.swf", 
                {"videoCodec": "H264Avc", "codec": "pcmu", "framesPerPacket": "2", "prefix": "network."},
                {"allowScriptAccess": "always", "allowFullScreen": "true", "bgcolor": "#f0f0f0"},
                {"id": "local-video", "name": "local-video"});
      
            swfobject.embedSWF("http://theintencity.kundansingh.com/flash-network/VideoIO11.swf", "remote-video", "240", "168", "11.0.0", "http://theintencity.kundansingh.com/flash-network/expressInstall.swf",
                {"videoCodec": "H264Avc", "codec": "pcmu", "framesPerPacket": "2", "prefix": "network."},
                {"allowScriptAccess": "always", "allowFullScreen": "true", "bgcolor": "#f0f0f0"},
                {"id": "remote-video", "name": "remote-video"});
        }, 600);
    }
    else {
        $('local-video').innerHTML = "";
        $('remote-video').innerHTML = "";
        $('flash-network').innerHTML = "";
        
        phone.detectHTML5();
        $('webrtc-network').style.visibility = "visible";
    }

    
};
