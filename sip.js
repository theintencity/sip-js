// Copyright (c) 2011-2012, Intencity Cloud Technologies
// Copyright (c) 2011-2012, Kundan Singh
// This software is licensed under LGPL.
// See README and http://code.google.com/p/sip-js for details.

if (typeof sip == "undefined") {
    sip = {};
}



//==============================================================================
// utils
//==============================================================================



(function(sip){
    
    sip.filter = function(lambda, list) {
        var result = [];
        for (var i=0; i<list.length; ++i) {
            if (lambda(list[i]))
                result.push(list[i]);
        }
        return result;
    };
    
    sip.map = function(lambda, list) {
        var result = [];
        for (var i=0; i<list.length; ++i) {
            result.push(lambda(list[i]));
        }
        return result;
    };
    
    sip.str_partition = function(value, sep) {
        var index = value.indexOf(sep);
        return index >= 0 ? [value.substr(0, index), sep, value.substr(index+sep.length)] : [value, '', '']
    };
    
    sip.str_strip = function(value) {
        return value.replace(/^\s+/g, '').replace(/\s+$/g, '');
    };
    
    sip.str_slice = function(str, first, second) {
        if (typeof first == "undefined" || first < 0)
            first = 0;
        if (typeof second == "undefined" || second > str.length)
            second = str.length;
        var result = [];
        for (var i=first; i<second; ++i) {
            result.push(str.charAt(i));
        }
        return result.join('');
    };
    sip.list_slice = function(list, first, second) {
        if (typeof first == "undefined" || first < 0)
            first = 0;
        if (typeof second == "undefined" || second > list.length)
            second = list.length;
        var result = [];
        for (var i=first; i<second; ++i) {
            result.push(list[i]);
        }
        return result;
    };
    
    sip.dict_items = function(dict) {
        var result = [];
        for (var s in dict) {
            result.push([s, dict[s]]);
        }
        return result;
    };

    sip.is_array = function(obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    };
    
    // modified from parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com>, MIT License, http://blog.stevenlevithan.com/archives/parseuri
    
    sip.parse_uri_options = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   { name:   "queryKey", parser: /(?:^|&)([^&=]*)=?([^&]*)/g },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };
    
    sip.parse_uri = function(str) {
        var	o = sip.parse_uri_options, m = o.parser[o.strictMode ? "strict" : "loose"].exec(str), uri = {}, i = 14;
        while (i--) uri[o.key[i]] = m[i] || "";
        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) { if ($1) uri[o.q.name][$1] = $2; });
        return uri;
    };
    
    
    // Base64 encode/decode ported from http://www.webtoolkit.info/

    // private property
    sip._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
    sip.b64_encode = function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        
        input = sip._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3)) {
                enc4 = 64;
            }
            
            output = output + sip._keyStr.charAt(enc1) + sip._keyStr.charAt(enc2) + sip._keyStr.charAt(enc3) + sip._keyStr.charAt(enc4);
        }
        return output;
    };
    
    sip.b64_decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        
        output = sip._utf8_decode(output);
        return output;
    
    };
    
    sip._utf8_encode = function(string) {
        //string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    
    sip._utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    };
    
    // unlike Python's base64.urlsafe_encode, result does not contain "=". It replaces "=" with "."
    sip.b64_urlsafe_encode = function(input) {
        return sip.b64_encode(input).replace(/\+/g,"-").replace(/\//g, "_").replace(/=/g, ".");
    };
    
    // MD5 (Message-Digest Algorithm) ported from http://www.webtoolkit.info/
    sip.MD5 = function(string) {
        function RotateLeft(lValue, iShiftBits) {
            return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
        }
        
        function AddUnsigned(lX,lY) {
            var lX4,lY4,lX8,lY8,lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            }
            else {
                return (lResult ^ lX8 ^ lY8);
            }
        }
        
        function F(x,y,z) { return (x & y) | ((~x) & z); }
        function G(x,y,z) { return (x & z) | (y & (~z)); }
        function H(x,y,z) { return (x ^ y ^ z); }
        function I(x,y,z) { return (y ^ (x | (~z))); }
        
        function FF(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };
        
        function GG(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };
        
        function HH(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };
        
        function II(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };
        
        function ConvertToWordArray(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1=lMessageLength + 8;
            var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
            var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
            var lWordArray=Array(lNumberOfWords-1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while ( lByteCount < lMessageLength ) {
                lWordCount = (lByteCount-(lByteCount % 4))/4;
                lBytePosition = (lByteCount % 4)*8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
            lWordArray[lNumberOfWords-2] = lMessageLength<<3;
            lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
            return lWordArray;
        };
        
        function WordToHex(lValue) {
            var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
            for (lCount = 0;lCount<=3;lCount++) {
                lByte = (lValue>>>(lCount*8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
            }
            return WordToHexValue;
        };
        
        function Utf8Encode(string) {
            //string = string.replace(/\r\n/g,"\n");
            var utftext = "";
            
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            
            }
            
            return utftext;
        };
        
        var x=Array();
        var k,AA,BB,CC,DD,a,b,c,d;
        var S11=7, S12=12, S13=17, S14=22;
        var S21=5, S22=9 , S23=14, S24=20;
        var S31=4, S32=11, S33=16, S34=23;
        var S41=6, S42=10, S43=15, S44=21;
        
        string = Utf8Encode(string);
        
        x = ConvertToWordArray(string);
        
        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
        
        for (k=0;k<x.length;k+=16) {
            AA=a; BB=b; CC=c; DD=d;
            a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
            d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
            c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
            b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
            a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
            d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
            c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
            b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
            a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
            d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
            c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
            b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
            a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
            d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
            c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
            b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
            a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
            d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
            c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
            b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
            a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
            d=GG(d,a,b,c,x[k+10],S22,0x2441453);
            c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
            b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
            a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
            d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
            c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
            b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
            a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
            d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
            c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
            b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
            a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
            d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
            c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
            b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
            a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
            d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
            c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
            b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
            a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
            d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
            c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
            b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
            a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
            d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
            c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
            b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
            a=II(a,b,c,d,x[k+0], S41,0xF4292244);
            d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
            c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
            b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
            a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
            d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
            c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
            b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
            a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
            d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
            c=II(c,d,a,b,x[k+6], S43,0xA3014314);
            b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
            a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
            d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
            c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
            b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
            a=AddUnsigned(a,AA);
            b=AddUnsigned(b,BB);
            c=AddUnsigned(c,CC);
            d=AddUnsigned(d,DD);
        }
        
        var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
        return temp.toLowerCase();
    };
 
})(sip);



//==============================================================================
// rfc2396.py
//==============================================================================



(function(sip){
    
    //--------------------------------------------------------------------------
    // isIPv4, isMulticast, isLocal, isPrivate
    //--------------------------------------------------------------------------
    
    sip._testIP = function() {
        assert(sip.isIPv4("1.2.3.4") == true, 'isIPv4("1.2.3.4") == true');
        assert(sip.isIPv4("1.2.3.4.5") == false, 'isIPv4("1.2.3.4.5") == false');
        assert(sip.isIPv4("1.2.3") == false, 'isIPv4("1.2.3") == false');
        assert(sip.isIPv4("hos.tna.me.is") == false, 'isIPv4("hos.tna.me.is") == false');
        assert(sip.isIPv4("1.2.3.256") == false, 'isIPv4("1.2.3.256") == false');
        
        assert(sip.isMulticast("224.1.2.3") == true, 'sip.isMulticast("224.1.2.3") == true');
        assert(sip.isMulticast("125.1.2.3") == false, 'sip.isMulticast("125.1.2.3") == true');
        
        assert(sip.isLocal("127.0.0.1") == true, 'sip.isLocal("127.0.0.1") == true');
        assert(sip.isLocal("127.0.1.1") == false, 'sip.isMulticast("127.0.1.1") == false');

        assert(sip.isPrivate("127.0.0.1") == false, 'sip.isPrivate("127.0.0.1") == false');
        assert(sip.isPrivate("10.1.2.3") == true, 'sip.isPrivate("10.1.2.3") == true');
        assert(sip.isPrivate("192.168.1.2") == true, 'sip.isPrivate("192.168.1.2") == true');
        assert(sip.isPrivate("172.19.1.2") == true, 'sip.isPrivate("172.19.1.2") == true');
    };
    
    sip._ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    sip._ipToParts = function(data) {
        var array = data.match(this._ipv4);
        if (array == null)
            return false;
        array = sip.filter(function(x) { return x < 256; }, sip.map(parseInt, sip.list_slice(array, 1)));
        return array.length == 4 ? array : false;
    };
    
    sip.isIPv4 = function(data) {
        return sip._ipToParts(data) != false;
    };
    
    sip.isMulticast = function(data) {
        var parts = sip._ipToParts(data);
        return (parts && ((parts[0] & 0xf0) == 0xe0));
    };
    
    sip.isLocal = function(data) {
        return data == "127.0.0.1";
    };
    
    sip.isPrivate = function(data) {
        var parts = sip._ipToParts(data);
        return parts && (parts[0] == 10 || parts[0] == 172 && parts[1] >= 16 && parts[1] < 32 || parts[0] == 192 && parts[1] == 168);
    };
    
    //--------------------------------------------------------------------------
    // URI
    //--------------------------------------------------------------------------
    
    sip._testURI = function() {
        assert((new sip.URI("sip:kundan@example.net")).toString() == "sip:kundan@example.net", 'URI("sip:kundan@example.net")');
        assert((new sip.URI("sip:kundan:passwd@example.net:5060;transport=udp;lr?name=value&another=another")).toString() == "sip:kundan:passwd@example.net:5060;transport=udp;lr?name=value&another=another", 'URI("sip:kundan:passwd@example.net:5060;transport=udp;lr?name=value&another=another")');
        assert((new sip.URI("sip:192.1.2.3:5060")).toString() == "sip:192.1.2.3:5060", 'URI("sip:192.1.2.3:5060")');
        assert((new sip.URI("sip:kundan@example.net")).equals(new sip.URI("sip:Kundan@Example.NET")), 'URI("sip:kundan@example.net").equals(URI("sip:Kundan@Example.NET"))');
        assert((new sip.URI()).toString() == "", 'URI() empty');
        assert((new sip.URI("tel:+1-212-9397063")).toString() == "tel:+1-212-9397063", 'URI("tel:+1-212-9397063")');
        var hostPort = (new sip.URI("sip:kundan@192.1.2.3:5060")).getHostPort();
        assert(hostPort[0] == "192.1.2.3" && hostPort[1] == 5060, 'URI("sip:kundan@192.1.2.3:5060").getHostPort()');
    };
    
    function URI(value) {
        if (value !== undefined) {
            var m = value.match(URI._syntax);
            var params, headers;
            if (m) {
                this.scheme = m[1];
                this.user = m[4];
                this.password = m[6];
                this.host = m[9];
                this.port = m[11];
                params = m[13];
                headers = m[15];
            }
            else if (value.match(URI._syntax_urn)) {
                m = value.match(URI._syntax_urn);
                this.scheme = m[1];
                this.host = m[2];
            }
            else {
                throw new String("Invalid URI(" + value + ")");
            }
            
            if (this.scheme == "tel" && this.user == null) {
                this.user = this.host;
                this.host = null;
            }
            if (this.port)
                this.port = parseInt(this.port);
            this.param = {};
            if (params) {
                var parts = params.split(';');
                for (var i=0; i<parts.length; ++i) {
                    var nv = sip.str_partition(parts[i], '=');
                    this.param[nv[0]] = nv[2] || null;
                }
            }
            this.header = headers ? headers.split('&') : [];
        }
        else {
            this.scheme = null;
            this.user = null;
            this.password = null;
            this.host = null;
            this.port = null;
            this.param = {};
            this.header = [];
        }
    }
    
    URI._syntax = /^([a-zA-Z][a-zA-Z0-9\+\-\.]*):((([a-zA-Z0-9\-\_\.\!\~\*\'\(\)&=\+\$,;\?\/\%]+)(:([^:@;\?]+))?)@)?((([^;\?:]*)(:([\d]+))?))(;([^\?]*))?(\?(.*))?$/;
    URI._syntax_urn = /^(urn):([^;\?>]+)$/;
    
    URI.prototype.toString = function() {
        var user = this.scheme == 'tel' ? null : this.user;
        var host = this.scheme == 'tel' ? this.user : this.host;
        var params = sip.map(function(x) { return x[1] !== null ? x[0] + '=' + x[1] : x[0];}, sip.dict_items(this.param)).join(';');
        return this.scheme && host ? (this.scheme + ':' + (user ? (user + 
          (this.password ? (':'+this.password) : '') + '@') : '') + 
          (host ? ((host ? host : '') + (this.port ? (':'+this.port) : '')) : '') + 
          (params ? (';' + params) : '') + 
          (this.header.length > 0 ? ('?' + this.header.join('&')) : '')) : '';
    };
    
    URI.prototype.dup = function() {
        return new URI(this.toString());
    };
    
    URI.prototype.getHostPort = function() {
        return [this.host, this.port];
    };
    
    URI.prototype.equals = function(other) {
        return this.toString().toLowerCase() ==  other.toString().toLowerCase();
    };
    
    URI.prototype.setSecure = function(value) {
        if (value && ["sip", "http"].indexOf(this.scheme) >= 0)
            this.scheme += "s";
    };
    
    URI.prototype.getSecure = function() {
        return ["sips", "https"].indexOf(this.scheme) >= 0;  
    };
    
    sip.URI = URI;
    
    //--------------------------------------------------------------------------
    // Address
    //--------------------------------------------------------------------------

    sip._testAddress = function() {
        var a1 = new sip.Address('"Kundan Singh" <sip:kundan@example.net>')
        var a2 = new sip.Address('Kundan Singh   <sip:kundan@example.net>')
        var a3 = new sip.Address('"Kundan Singh" <sip:kundan@example.net>   ')
        var a4 = new sip.Address('<sip:kundan@example.net>')
        var a5 = new sip.Address('sip:kundan@example.net')
        assert(a1.toString() == '"Kundan Singh" <sip:kundan@example.net>', 'Address(\'"Kundan Singh" <sip:kundan@example.net>\').toString()');
        assert(a1.toString() == a2.toString(), '\'"Kundan Singh" <sip:kundan@example.net>\' == \'Kundan Singh   <sip:kundan@example.net>\'');
        assert(a1.toString() == a3.toString(), '\'"Kundan Singh" <sip:kundan@example.net>\' == \'"Kundan Singh" <sip:kundan@example.net>   \'');
        assert(a1.uri.toString() == a4.uri.toString(), 'Address("<sip:kundan@example.net>").uri');
        assert(a1.uri.toString() == a5.uri.toString(), 'Address("sip:kundan@example.net").uri');
        assert(a1.getDisplayable() == "Kundan Singh", 'Address(\'"Kundan Singh" <sip:kundan@example.net>\').getDisplayable()');
    };
    
    function Address(value) {
        this.displayName = null;
        this.uri = null;
        this.wildcard = false;
        this.mustQuote = false;
        if (value)
            this.parse(value);
    }
    
    Address._syntax = [/^([a-zA-Z0-9\-\.\_\+\~\ \t]*)<([^>]+)>/, /^"([^"]+)"[\ \t]*<([^>]+)>/, /^[\ \t]*()([^;]+)/];
    
    Address.prototype.parse = function(value) {
        if (value.substr(0, 1) == '*') {
            this.wildcard = true;
            return 1;
        }
        else {
            var length = 0;
            for (var i=0; i<Address._syntax.length; ++i) {
                var syntax = Address._syntax[i];
                var m = value.match(syntax);
                if (m) {
                    this.displayName = sip.str_strip(m[1]);
                    this.uri = new sip.URI(sip.str_strip(m[2]));
                    length = m[0].length;
                    break;
                }
            }
            return length;
        }
    };
    
    Address.prototype.toString = function() {
        return (this.uri ? (this.displayName ? ('"' + this.displayName + '"' + (this.uri ? ' ' : '')) : '') 
        + (((this.mustQuote || this.displayName ? '<' : '') 
        + this.uri.toString()
        + (this.mustQuote || this.displayName ? '>' : ''))) : '')
    };
    
    Address.prototype.dup = function() {
        return new Address(this.toString());
    };
    
    Address.prototype.getDisplayable = function(limit) {
        if (limit === undefined)
            limit = 25;
        var name = this.displayName || this.uri && this.uri.user || this.uri && this.uri.host || '';
        return name.length <= limit ? name : name.substr(0, limit-3) + '...';
    };
    
    sip.Address = Address;
    
})(sip);



//==============================================================================
// rfc3261.py
//==============================================================================



(function(sip){
    //--------------------------------------------------------------------------
    // utils
    //--------------------------------------------------------------------------
    
    sip._quote = function(value) {
        return value.length >= 2 && value[0] == '"' && value[value.length-1] == '"' ? value : '"' + value + '"';  
    };
    
    sip._unquote = function(value) {
        return value.length >= 2 && value[0] == '"' && value[value.length-1] == '"' ? value.substr(1, value.length-2) : value;
    }
    
    sip._address = ['contact', 'from', 'record-route', 'refer-to', 'referred-by', 'route', 'to'];
    sip._comma = ['authorization', 'proxy-authenticate', 'proxy-authorization', 'www-authenticate'];
    sip._unstructured = ['call-id', 'cseq', 'date', 'expires', 'max-forwards', 'organization', 'server', 'subject', 'timestamp', 'user-agent'];
    sip._short = ['allow-events', 'u', 'call-id', 'i', 'contact', 'm', 'content-encoding', 'e', 'content-length', 'l', 'content-type', 'c', 'event', 'o', 'from', 'f', 'subject', 's', 'supported', 'k', 'to', 't', 'via', 'v'];
    sip._exception = {'call-id':'Call-ID','cseq':'CSeq','www-authenticate':'WWW-Authenticate'};
    
    sip._testCanon = function() {
        assert(sip._canon('call-id') == 'Call-ID', '_canon("call-id") == "Call-ID"');
        assert(sip._canon('fRoM') == 'From', '_canon("fRoM") == "From"');
        assert(sip._canon('refer-to') == 'Refer-To', '_canon("refer-to") == "Refer-To"');
    };
    
    sip._canon = function(value) {
        value = value.toLowerCase();
        if (value.length == 1 && sip._short[value] !== undefined)
            return sip._canon(sip._short[sip._short.indexOf(value) - 1]);
        else if (sip._exception[value] !== undefined)
            return sip._exception[value];
        else
            return sip.map(function(x) {return x.charAt(0).toUpperCase() + sip.str_slice(x, 1)}, value.split('-')).join('-');
    };
  
    //--------------------------------------------------------------------------
    // Header
    //--------------------------------------------------------------------------
    
    sip._testHeader = function() {
        assert((new sip.Header('"Kundan Singh" <sip:kundan@example.net>', 'To')).toRepr() == 'To: "Kundan Singh" <sip:kundan@example.net>', 'Header(\'"Kundan Singh" <sip:kundan@example.net>\', "To")');
        assert((new sip.Header('"Kundan"<sip:kundan99@example.net>', 'To')).toRepr() == 'To: "Kundan" <sip:kundan99@example.net>', 'Header(\'"Kundan"<sip:kundan99@example.net>\', "To")');
        assert((new sip.Header('Henry <sip:henry.sinnreich@example.net>', 'fRoM')).toRepr() == 'From: "Henry" <sip:henry.sinnreich@example.net>', 'Header(\'Henry <sip:henry.sinnreich@example.net>\', "fRoM")');
        assert((new sip.Header('application/sdp', 'conTenT-tyPe')).toRepr() == 'Content-Type: application/sdp', 'Header("application/sdp", "conTenT-tyPe")');
        assert((new sip.Header('presence; param=value;param2=another', 'Event')).toRepr() == 'Event: presence;param=value;param2=another', "Header('presence; param=value;param2=another', 'Event')");
        assert((new sip.Header('78  INVITE', 'CSeq')).toRepr() == 'CSeq: 78 INVITE', "Header('78  INVITE', 'CSeq')");
    };
    
    function Header(value, name) {
        this.name = (name !== undefined ? sip._canon(sip.str_strip(name)) : null);
        this.value = this._parse(sip.str_strip(value), this.name ? this.name.toLowerCase() : null);
    }
    
    Header.prototype._parseParams = function(params, unquote) {
        try {
            var length = params.length, index = 0;
            while (index < length) {
                var sep1 = params.indexOf('=', index);
                var sep2 = params.indexOf(';', index);
                if (sep2 < 0) {
                    sep2 = length;
                }
                var n = "", v = "";
                if (sep1 >= 0 && sep1 < sep2) {
                    var n = sip.str_strip(params.substring(index, sep1).toLowerCase());
                    if (params.charAt(sep1+1) == '"') {
                        sep1 += 1;
                        sep2 = params.indexOf('"', sep1+2);
                    }
                    v = sip.str_strip(params.substring(sep1+1, sep2));
                    index = sep2 + 1;
                }
                else if (sep1 < 0 || sep1 >= 0 && sep1 > sep2) {
                    n = sip.str_strip(params.substring(index, sep2).toLowerCase());
                    index = sep2 + 1;
                }
                else {
                    break;
                }
                if (n) {
                    this[n] = v;
                }
            }
        } catch (error) {
            log("ignoring parameter exception: " + error);
        }
    };
        
    //Header.prototype._parseParams = function(params, unquote) {
    //    var parts = params.split(';');
    //    for (var i=0; i<parts.length; ++i) {
    //        var nv = parts[i];
    //        var nsv = sip.str_partition(nv, '=');
    //        var n = sip.str_strip(nsv[0]);
    //        var v = sip.str_strip(nsv[2]);
    //        if (n) {
    //            if (v && unquote) {
    //                v = sip._unquote(v);
    //            }
    //            this[n.toLowerCase()] = v;
    //        }
    //    }
    //};
    
    Header.prototype._parse = function(value, name) {
        if (sip._address.indexOf(name) >= 0) {
            var addr = new sip.Address();
            addr.mustQuote = true;
            var count = addr.parse(value);
            var rest = value.substr(count);
            value = addr;
            if (rest) {
                this._parseParams(rest, false);
            }
        }
        else if (sip._comma.indexOf(name) < 0 && sip._unstructured.indexOf(name) < 0) {
            var vsr = sip.str_partition(value, ';');
            value = vsr[0];
            var rest = vsr[2];
            if (rest) {
                this._parseParams(rest, false);
            }
        }
        else if (sip._comma.indexOf(name) >= 0) {
            var asr = sip.str_partition(value, ' ');
            this.authMethod = asr[0];
            var rest = asr[2];
            if (rest) {
                this._parseParams(rest, true);
            }
        }
        else if (name == 'cseq') {
            nsm = sip.str_partition(value, ' ');
            var n = sip.str_strip(nsm[0]);
            this.method = sip.str_strip(nsm[2]);
            this.number = parseInt(n);
            value = n + ' ' + this.method;
        }
        return value;
    };
    
    Header.prototype.toString = function() {
        var name = this.name.toLowerCase();
        var rest = [];
        if (sip._comma.indexOf(name) < 0 && sip._unstructured.indexOf(name) < 0) {
            var ex = ['name','value', '_viauri'];
            for (var s in this) {
                if (typeof s == 'string' && ex.indexOf(s.toLowerCase()) < 0 && typeof this[s] != 'function') {
                    var v = this[s];
                    if (v && !/^[a-zA-Z0-9\-_\.=]*$/.test(v)) {
                        v = '"' + v + '"';
                    }
                    rest.push(v ? s.toLowerCase() + '=' + v : s);
                }
            }
        }
        return this.value.toString() + (rest.length > 0 ? ';' + rest.join(';') : '');
    };
    
    Header.prototype.toRepr = function() {
        return this.name + ": " + this.toString();
    };
    
    Header.prototype.dup = function() {
        return Header(this.toString(), this.name);
    };
    
    Header.prototype.getItem = function(name) {
        var nameLower = name.toLowerCase();
        return (this[nameLower] !== undefined ? this[nameLower] : null);
    };
    
    Header.prototype.setItem = function(name, value) {
        var nameLower = name.toLowerCase();
        this[nameLower] = value;
    };
    
    Header.prototype.hasItem = function(name) {
        return this[name.toLowerCase()] !== undefined;
    };
    
    sip._testViaUri = function() {
        assert((new sip.Header('SIP/2.0/UDP example.net:5090;ttl=1', 'Via')).getViaUri().toString() == "sip:example.net:5090;transport=udp", "Header('SIP/2.0/UDP example.net:5090;ttl=1', 'Via').getViaUri()");
        assert((new sip.Header('SIP/2.0/UDP 192.1.2.3;rport=1078;received=76.17.12.18;branch=0', 'Via')).getViaUri().toString() == "sip:76.17.12.18:1078;transport=udp", "Header('SIP/2.0/UDP 192.1.2.3;rport=1078;received=76.17.12.18;branch=0', 'Via').getViaUri()");
        assert((new sip.Header('SIP/2.0/UDP 192.1.2.3;maddr=224.0.1.75', 'Via')).getViaUri().toString() == "sip:224.0.1.75:5060;transport=udp", "Header('SIP/2.0/UDP 192.1.2.3;maddr=224.0.1.75', 'Via').getViaUri()");
    };
    
    Header.prototype.getViaUri = function() {
        if (this['_viaUri'] === undefined) {
            if (this.name != 'Via')
                throw new String('getViaUri() available only on Via header');
            var psa = sip.str_partition(this.value, ' ');
            var proto = psa[0];
            var addr = psa[2];
            var type = proto.split('/')[2].toLowerCase();
            this._viaUri = new sip.URI('sip:' + addr + ';transport=' + type);
            if (!this._viaUri.port)
                this._viaUri.port = 5060;
            if (this['rport'] !== undefined) {
                try {
                    this._viaUri.port = (typeof this['rport'] == 'number' ? parseInt(this['rport']) : this['rport']);
                }
                catch (e) {
                    // ignore
                }
            }
            if (type != 'tcp' && type != 'sctp' && type != 'tls') {
                if (this['maddr'] !== undefined)
                    this._viaUri.host = this['maddr'];
                else if (this['received'] !== undefined)
                    this._viaUri.host = this['received'];
            }
        }
        return this['_viaUri'];
    };
    
    sip._testCreateHeaders = function() {
        var result = sip.Header.createHeaders('Event: presence, reg');
        assert(result[0] == 'Event', 'Header.createHeaders("Event: presence, reg")[0] != "Event"')
        assert(result[1].length == 2, 'Header.createHeaders("Event: presence, reg")[1].length != 2')
        assert(result[1][0].toRepr() == 'Event: presence', 'Header.createHeaders("Event: presence, reg")[1][0].toRepr() != "Event: presence"')
        assert(result[1][1].toRepr() == 'Event: reg', 'Header.createHeaders("Event: presence, reg")[1][1].toRepr() != "Event: reg"')
    };
    
    // staticmethod
    Header.createHeaders = function(value) {
        var nsv = sip.str_partition(value, ':');
        var name = sip.str_strip(nsv[0]);
        value = sip.str_strip(nsv[2]);
        var headers;
        if (sip._comma.indexOf(name.toLowerCase()) >= 0) {
            headers = [new sip.Header(value, name)];
        }
        else {
            headers = sip.map(function(item) { return new sip.Header(item, name); }, value.split(','));
        }
        return [sip._canon(name), headers];
        
    };
    
    sip.Header = Header;
    

    //--------------------------------------------------------------------------
    // Header
    //--------------------------------------------------------------------------

    sip._testMessage = function() {
        var t1 = 
            "INVITE sip:kundan@example.net SIP/2.0\r\n" +
            "From: <sip:henry@iptel.org>\r\n" +
            "To: <sip:kundan@example.net>\r\n" + 
            "Call-ID: 1234@127.0.0.1\r\n" +
            "CSeq: 1 INVITE\r\n" +
            "Content-Length: 10\r\n" +
            "\r\nsomebody\r\n";
        assert((new sip.Message(t1)).toString() == t1, "Message(t1)")
    };
    
    function Message(value) {
        this.method = null;
        this.uri = null;
        this.response = null;
        this.responsetext = null;
        this.protocol = "SIP/2.0";
        this._body = null;
        this._headers = {};
        
        if (value !== undefined)
            this._parse(value);
    }
    
    Message._keywords = ['method','uri','response','responsetext','protocol','_body','body','_headers'];
    Message._single = ['call-id', 'content-disposition', 'content-length', 'content-type', 'cseq', 'date', 'expires', 'event', 'max-forwards', 'organization', 'refer-to', 'referred-by', 'server', 'session-expires', 'subject', 'timestamp', 'to', 'user-agent'];
    
    Message.prototype.getItem = function(name) {
        var nameLower = name.toLowerCase();
        return (this._headers[nameLower] !== undefined ? this._headers[nameLower] : null);
    };
    
    Message.prototype.setItem = function(name, value) {
        var nameLower = name.toLowerCase();
        this._headers[nameLower] = value;
    };
    
    Message.prototype.delItem = function(name) {
        var nameLower = name.toLowerCase();
        delete this._headers[nameLower];
    };
    
    Message.prototype.hasItem = function(name) {
        var nameLower = name.toLowerCase();
        return (this._headers[nameLower] !== undefined);
    };
    
    Message.prototype._parse = function(value) {
        var indexCRLFCRLF = value.indexOf("\r\n\r\n");
        var indexLFLF = value.indexOf("\n\n");
        var firstheaders, body;
        if (indexCRLFCRLF >=0 && indexLFLF >= 0) {
            // use lower value
            if (indexCRLFCRLF < indexLFLF)
                indexLFLF = -1;
            else
                indexCRLFCRLF = -1;
        }
        else if (indexCRLFCRLF < 0 && indexLFLF < 0)  {
            log("Message.parse() did not find LFLF or CRLFCRLF");
        }
        
        if (indexCRLFCRLF >= 0) {
            firstheaders = value.substr(0, indexCRLFCRLF);
            body = value.substr(indexCRLFCRLF+4);
        }
        else if (indexLFLF >= 0) {
            firstheaders = value.substr(0, indexLFLF);
            body = value.substr(indexLFLF+2);
        }
        else {
            firstheaders = value;
            body = ''; // no body
        }
        var firstline, headers;
        var indexLF = firstheaders.indexOf("\n");
        if (indexLF > 0 && firstheaders.charAt(indexLF-1) == "\r") {
            firstline = firstheaders.substr(0, indexLF-1);
            headers = firstheaders.substr(indexLF+1);
        }
        else if (indexLF > 0) {
            firstline = firstheaders.substr(0, indexLF);
            headers = firstheaders.substr(indexLF+1);
        }
        
        var parts = firstline.split(" ");
        if (parts.length < 3) {
            throw new String("not enough parts in first line");
        }
        
        if (parts[1].match(/^\d+$/)) {
            this.protocol = parts.shift();
            this.response = parseInt(parts.shift());
            this.responsetext = parts.join(" ");
        }
        else if (parts.length > 3) {
            throw new String("invalid number of parts in request line");
        }
        else {
            this.method = parts[0];
            this.uri = new sip.URI(parts[1]);
            this.protocol = parts[2];
        }
        
        parts = headers.split("\n");
        for (var i=0; i<parts.length; ++i) {
            var h = parts[i];
            if (h && h.charAt(h.length-1) == "\r") {
                h = h.substr(0, h.length-1);
            }
            if (h.charAt(0) == " " || h.charAt(0) == "\t") {
                // need to handle the line folding
            }
            try {
                var hdrs = sip.Header.createHeaders(h);
                var name = hdrs[0];
                var values = hdrs[1];
                if (!this.hasItem(name)) {
                    this.setItem(name, values.length > 1 ? values : values[0])
                }
                else if (Message._single.indexOf(name) < 0) {
                    var existing = this.getItem(name);
                    if (!sip.is_array(existing)) {
                        this.setItem(name, [existing]);
                    }
                    existing = this.getItem(name);
                    for (var j=0; j<values.length; ++j) {
                        existing.push(values[j]);
                    }
                }
            }
            catch (e) {
                log("error parsing " + h);
                if (e['stack'] !== undefined)
                    log(e.stack);
                else
                    log(e);
                continue;
            }
        }
        
        var bodyLen = (this.hasItem('Content-Length') ? parseInt(this.getItem('Content-Length').value) : 0);
        if (body) {
            this.setBody(body);
        
            if (bodyLen != body.length) {
                throw new String("invalid content length " + bodyLen + " != " + body.length);
            }
        }
        var mandatory = ["To", "From", "CSeq", "Call-ID"];
        for (var k=0; k<mandatory.length; ++k) {
            if (!this.hasItem(mandatory[k])) {
                throw new String("mandatory header " + mandatory[k] + " is missing");
            }
        }
    };
    
    Message.prototype.toString = function() {
        var m;
        if (this.method) {
            m = this.method + " " + this.uri.toString() + " " + this.protocol + "\r\n"; 
        }
        else if (this.response) {
            m = this.protocol + " " + this.response + " " + this.responsetext + "\r\n";
        }
        else {
            return null;
        }
        var headers = ["via", "from", "to", "call-id", "cseq", "max-forwards"]; // preferred headers at top
        for (var s in this._headers) {
            if (typeof this._headers[s] != 'function' && headers.indexOf(s) < 0)
                headers.push(s);
        }
        for (var i=0; i<headers.length; ++i) {
            var s = headers[i];
            if (this._headers[s] !== undefined) {
                var values = this._headers[s];
                if (sip.is_array(values)) {
                    for (var j=0; j<values.length; ++j) {
                        m += values[j].toRepr() + "\r\n";
                    }
                }
                else {
                    m += values.toRepr() + "\r\n";
                }
            }
        }
        m += "\r\n";
        if (this.body) {
            m += this.body;
        }
        return m;
    };
    
    Message.prototype.dup = function() {
        return new Message(this.toString());  
    };
    
    Message.prototype.first = function(name) {
        var result = this.getItem(name);
        return (sip.is_array(result) ? result[0] : result);
    };
    
    Message.prototype.all = function() {
        var args = sip.map(function(item) { return item.toLowerCase(); }, arguments ? arguments : []);
        var result = [];
        for (var i=0; i<args.length; ++i) {
            var values = this.getItem(args[i]);
            if (values !== null) {
                if (sip.is_array(values)) {
                    for (var j=0; j<values.length; ++j) {
                        result.push(values[j]);
                    }
                }
                else {
                    result.push(values);
                }
            }
        }
        return result;
    };
    
    Message.prototype.insert = function(header, append) {
        if (header && header.name) {
            if (!this.hasItem(header.name)) {
                this.setItem(header.name, header);
            }
            else {
                var values = this.getItem(header.name);
                if (!sip.is_array(values)) {
                    this.setItem(header.name, [values]);
                }
                values = this.getItem(header.name);
                if (append) {
                    values.push(header);
                }
                else {
                    values.splice(0, 0, header);
                }
            }
        }
    };
    
    Message.prototype.del = function(name, position) {
        if (position === undefined) {
            this.deleteItem(name);
        }
        else {
            var h = this.all(name);
            try {
                h.splice(position, 1);
            }
            catch (e) {
                // ignore
            }
            if (h.length == 0) {
                this.delItem(name);
            }
            else if (h.length == 1) {
                this.setItem(name, h[0]);
            }
            else {
                this.setItem(name, h);
            }
        }
    };
    
    Message.prototype.setBody = function(value) {
        this.body = value;
        this.setItem("Content-Length", new sip.Header(value ? "" + value.length : 0, "Content-Length"));
    };
    
    // staticmethod
    Message._populateMessage = function(m, headers, content) {
        if (headers) {
            for (var i=0; i<headers.length; ++i) {
                m.insert(headers[i], true);
            }
        }
        if (content) {
            m.setBody = content;
        }
        else {
            m.setItem("Content-Length", new sip.Header("0", "Content-Length"));
        }
    };
    
    // staticmethod
    Message.createRequest = function(method, uri, headers, content) {
        var m = new sip.Message();
        m.method = method;
        m.uri = typeof uri == "string" ? new sip.URI(uri) : uri;
        m.protocol = "SIP/2.0";
        Message._populateMessage(m, headers, content);
        if (m.hasItem("CSeq") && m.getItem("CSeq").method != method) {
            m.setItem("CSeq", new sip.Header("" + m.getItem("CSeq").number + " " + method, "CSeq"));
        }
        return m;
    };
    
    // staticmethod
    Message.createResponse = function(response, responsetext, headers, content, r) {
        var m = new sip.Message();
        m.response = response;
        m.responsetext = responsetext;
        if (r !== undefined) {
            m.setItem("To", r.getItem("To"));
            m.setItem("From", r.getItem("From"));
            m.setItem("CSeq", r.getItem("CSeq"));
            m.setItem("Call-ID", r.getItem("Call-ID"));
            m.setItem("Via", r.getItem("Via"));
            if (response == 100 && r.hasItem("Timestamp")) {
                m.setItem("Timestamp", r.getItem("Timestamp"));
            }
        }
        Message._populateMessage(m, headers, content);
        return m;
    };
    
    Message.prototype.is1xx = function() {
        return this.response && Math.floor(this.response / 100) == 1;
    }
    Message.prototype.is2xx = function() {
        return this.response && Math.floor(this.response / 100) == 2;
    }
    Message.prototype.is3xx = function() {
        return this.response && Math.floor(this.response / 100) == 3;
    }
    Message.prototype.is4xx = function() {
        return this.response && Math.floor(this.response / 100) == 4;
    }
    Message.prototype.is5xx = function() {
        return this.response && Math.floor(this.response / 100) == 5;
    }
    Message.prototype.is6xx = function() {
        return this.response && Math.floor(this.response / 100) == 6;
    }
    Message.prototype.isfinal = function() {
        return this.response && this.response >= 200;
    }
    
    sip.Message = Message;


    //--------------------------------------------------------------------------
    // Transaction
    //--------------------------------------------------------------------------

    function Transaction(server) {
        this.branch = null;
        this.id = null;
        this.stack = null;
        this.app = null;
        this.request = null;
        this.transport = null;
        this.remote = null;
        this.tag = null;
        this.state = null;
        this.server = server;
        this.timers = {};
        this.timer = new sip.Timer();
        
        this.close = function() {
            this.stopTimers();
            if (this.stack) {
                log("closing transaction " + this.id);
                if (this.stack.transactions[this.id] !== undefined)
                    delete this.stack.transactions[this.id];
            }
        };
        
        this.setState = function(value) {
            this.state = value;
            if (this.state == "terminated") {
                this.close();
            }
        };
        
        this.getHeaders = function() {
            var request = this.request;
            return sip.map(function(item) { return request.getItem(item); }, ["To", "From", "CSeq", "Call-ID"]);
        };
        
        this.createAck = function() {
            return (this.request && !this.server ? Message.createRequest('ACK', this.request.uri.toString(), this.getHeaders()) : null);
        };
        
        this.createCancel = function() {
            var m = (this.request && !this.server ? Message.createRequest('CANCEL', this.request.uri.toString(), this.getHeaders())  : null);
            if (m && this.request.hasItem("Route")) {
                m.setItem("Route", this.request.getItem("Route"));
            }
            if (m) {
                m.setItem("Via", this.request.first("Via"));
            }
            return m;
        };
            
        this.createResponse = function(response, responsetext) {
            var m = (this.request && this.server ? Message.createResponse(response, responsetext, null, null, this.request) : null);
            var to = m.getItem("To");
            if (response != 100 && to["tag"] === undefined) {
                to['tag'] = this.tag;
            }
            return m;
        };
        
        this.startTimer = function(name, timeout) {
            if (timeout > 0) {
                var timer;
                if (this.timers[name] !== undefined) {
                    timer = this.timers[name];
                }
                else {
                    timer = this.stack.createTimer(this);
                    this.timers[name] = timer;
                }
                timer.delay = timeout;
                timer.start();
            }
        };
    
        this.stopTimers = function() {
            for (var s in this.timers) {
                var v = this.timers[s];
                delete this.timers[s];
                v.stop();
            }
        };
    
        this.timedout = function(timer) {
            if (timer.running) {
                timer.stop();
            }
            var invoked = false;
            for (var s in this.timers) {
                var v = this.timers[s];
                if (v === timer) {
                    delete this.timers[s];
                    if (!invoked) {
                        invoked = true;
                        this.timeout(s, timer.delay);
                    }
                }
            }
        };
        
    }
    
    
    // staticmethod
    Transaction.createBranch = function(request, server) {
        var to, from, callid, cseq;
        if (sip.is_array(request)) {
            to = request[0];
            from = request[1];
            callid = request[2];
            cseq = request[3];
        }
        else {
            to = request.getItem("To").value;
            from = request.getItem("From").value;
            callid = request.getItem("Call-ID").value;
            cseq = request.getItem("CSeq").number;
        }
        var data = to.toString().toLowerCase() + "|" + from.toString().toLowerCase() + "|" + callid.toString() + "|" + cseq.toString();
        return 'z9hG4bK' + sip.b64_urlsafe_encode(sip.MD5(data));
    };
    
    // staticmethod
    Transaction.createProxyBranch = function(request, server) {
        var via = request.first("Via");
        if (via && via["branch"] !== undefined)
            return 'z9hG4bK'+ sip.b64_urlsafe_encode(sip.MD5(via.branch));
        else
            return Transaction.createBranch(request, server);
    };
    
    // staticmethod
    Transaction.createId = function(branch, method) {
        return (method != "ACK" && method != "CANCEL" ? branch : branch + '|' + method);
    };
    
    // staticmethod
    Transaction.createServer = function(stack, app, request, transport, tag, start) {
        if (start === undefined)
            start = true;
        var t = (request.method == 'INVITE' ? new sip.InviteServerTransaction() : new sip.ServerTransaction());
        t.stack = stack;
        t.app = app;
        t.request = request;
        t.transport = transport;
        t.tag = tag;
        var firstVia = request.first("Via");
        t.remote = (firstVia ? firstVia.getViaUri().getHostPort() : null);
        t.branch = (firstVia && firstVia["branch"] !== undefined ? firstVia.branch : Transaction.createBranch(request, true));
        t.id = Transaction.createId(t.branch, request.method);
        stack.transactions[t.id] = t;
        if (start)
            t.start();
        else
            t.state = 'trying';
        return t;
    };
    
    // staticmethod
    Transaction.createClient = function(stack, app, request, transport, remote) {
        var t = (request.method == 'INVITE' ? new sip.InviteClientTransaction() : new sip.ClientTransaction());
        t.stack = stack;
        t.app = app;
        t.request = request;
        t.remote = remote;
        t.transport = transport;
        var firstVia = request.first("Via");
        t.branch = (firstVia && firstVia["branch"] !== undefined ? firstVia.branch : Transaction.createBranch(request, false));
        t.id = Transaction.createId(t.branch, request.method);
        stack.transactions[t.id] = t;
        t.start();
        return t;
    };
    
    // staticmethod
    Transaction.equals = function(t1, r, t2) {
        var t = t1.request;
        var a = t.getItem("To").value.uri.equals(r.getItem("To").value.uri);
        a = a && t.getItem("From").value.uri.equals(r.getItem("From").value.uri);
        a = a && (t.getItem("Call-ID").value == r.getItem("Call-ID").value);
        a = a && (r.getItem("CSeq").value == r.getItem("CSeq").value);
        a = a && (t.getItem("From").tag == r.getItem("From").tag);
        a = a && (t2.server == t1.server);
        return a;
    };
    
    sip.Transaction = Transaction;


    //--------------------------------------------------------------------------
    // Timer
    //--------------------------------------------------------------------------

    function Timer(T1, T2, T4) {
        this.T1 = (T1 === undefined ? 500 : T1);
        this.T2 = (T2 === undefined ? 4000 : T2);
        this.T4 = (T4 === undefined ? 5000 : T4);
    }
    
    Timer.prototype.A = function() {
        return this.T1;
    };
    Timer.prototype.B = function() {
        return 64*this.T1;
    };
    Timer.prototype.D = function() {
        return Math.max(64*this.T1, 32000);
    };
    Timer.prototype.E = Timer.prototype.A;
    Timer.prototype.F = Timer.prototype.B;
    Timer.prototype.G = Timer.prototype.A;
    Timer.prototype.H = Timer.prototype.B;
    Timer.prototype.I = function() {
        return this.T4;
    };
    Timer.prototype.J = Timer.prototype.B;
    Timer.prototype.K = Timer.prototype.I;

    sip.Timer = Timer;
    
    
    //--------------------------------------------------------------------------
    // ClientTransaction
    //--------------------------------------------------------------------------
    
    function ClientTransaction() {
        this.base = sip.Transaction;
        this.base(false);
        delete this.base;
    
        this.start = function() {
            this.state = 'trying';
            if (!this.transport.reliable) 
                this.startTimer('E', this.timer.E());
            this.startTimer('F', this.timer.F());
            this.stack.send(this.request, this.remote, this.transport);
        }
            
        this.receivedResponse = function(response) {
            if (response.is1xx()) {
                if (this.state == 'trying') {
                    this.state = 'proceeding';
                    this.app.receivedResponse(this, response);
                }
                else if (this.state == 'proceeding') {
                    this.app.receivedResponse(this, response);
                }
            }
            else if (response.isfinal()) {
                if (this.state == 'trying' || this.state == 'proceeding') {
                    this.state = 'completed';
                    this.app.receivedResponse(this, response);
                    if (!this.transport.reliable) {
                        this.startTimer('K', this.timer.K())
                    }
                    else {
                        this.timeout('K', 0);
                    }
                }
            }
        };
            
        this.timeout = function(name, timeout) {
            if (this.state == 'trying' || this.state == 'proceeding') {
                if (name == 'E') {
                    timeout = (this.state == 'trying' ? Math.min(2*timeout, this.timer.T2) : this.timer.T2);
                    this.startTimer('E', timeout);
                    this.stack.send(this.request, this.remote, this.transport);
                }
                else if (name == 'F') {
                    this.state = 'terminated';
                    this.app.timeout(this);
                }
            }
            else if (this.state == 'completed') {
                if (name == 'K') {
                    this.state = 'terminated';
                }
            }
        };
                    
        this.error = function(error) {
            if (this.state == 'trying' || this.state == 'proceeding') {
                this.state = 'terminated';
                this.app.error(this, error);
            }
        };
    }
    
    sip.ClientTransaction = ClientTransaction;

    //--------------------------------------------------------------------------
    // ServerTransaction
    //--------------------------------------------------------------------------
    
    function ServerTransaction() {
        this.base = sip.Transaction;
        this.base(true);
        delete this.base;
    
        this.start = function() {
            this.state = 'trying';
            this.app.receivedRequest(this, this.request);
        };
        
        this.receivedRequest = function(request) {
            if (this.request.method == request.method) {
                if (this.state == 'proceeding' || this.state == 'completed') {
                    this.stack.send(this.lastResponse, this.remote, this.transport);
                }
                else if (this.state == 'trying') {
                    // ignore
                }
            }
        };
        
        this.timeout = function(name, timeout) {
            if (this.state == 'completed') {
                if (name == 'J') {
                    this.state = 'terminated';
                }
            }
        };
        
        this.error = function(error) {
            if (this.state == 'completed') {
                this.state = 'terminated';
                this.app.error(this, error);
            }
        };
        
        this.sendResponse = function(response) {
            this.lastResponse = response;
            if (response.is1xx()) {
                if (this.state == 'trying' || this.state == 'proceedings') {
                    this.state = 'proceeding';
                    this.stack.send(response, this.remote, this.transport);
                }
            }
            else if (response.isfinal()) {
                if (this.state == 'proceeding' || this.state == 'trying') {
                    this.state = 'completed';
                    this.stack.send(response, this.remote, this.transport);
                    if (!this.transport.reliable) {
                        this.startTimer('J', this.timer.J());
                    }
                    else {
                        this.timeout('J', 0);
                    }
                }
            }
        };
    }

    sip.ServerTransaction = ServerTransaction;
    
    
    //--------------------------------------------------------------------------
    // InviteClientTransaction
    //--------------------------------------------------------------------------
    
    function InviteClientTransaction() {
        this.base = sip.Transaction;
        this.base(false);
        delete this.base;
    
        this.start = function() {
            this.state = 'calling';
            if (!this.transport.reliable) {
                this.startTimer('A', this.timer.A());
            }
            this.startTimer('B', this.timer.B());
            this.stack.send(this.request, this.remote, this.transport);
        };
        
        this.receivedResponse = function(response) {
            if (response.is1xx()) {
                if (this.state == 'calling') {
                    this.state = 'proceeding';
                    this.app.receivedResponse(this, response);
                }
                else if (this.state == 'proceeding') {
                    this.app.receivedResponse(this, response);
                }
            }
            else if (response.is2xx()) {
                if (this.state == 'calling' || this.state == 'proceeding') {
                    this.state = 'terminated';
                    this.app.receivedResponse(this, response);
                }
            }
            else {
                if (this.state == 'calling' || this.state == 'proceeding') {
                    this.state = 'completed';
                    this.stack.send(this.createAck(response), this.remote, this.transport);
                    this.app.receivedResponse(this, response);
                    if (!this.transport.reliable) {
                        this.startTimer('D', this.timer.D());
                    }
                    else {
                        this.timeout('D', 0);
                    }
                }
                else if (this.state == 'completed') {
                    this.stack.send(this.createAck(response), this.remote, this.transport);
                }
            }
        };
                    
        this.timeout = function(name, timeout) {
            if (this.state == 'calling') {
                if (name == 'A') {
                    this.startTimer('A', 2*timeout);
                    this.stack.send(this.request, this.remote, this.transport);
                }
                else if (name == 'B') {
                    this.state = 'terminated';
                    this.app.timeout(this);
                }
            }
            else if (this.state == 'completed') {
                if (name == 'D') {
                    this.state = 'terminated';
                }
            }
        };
                    
        this.error = function(error) {
            if (this.state == 'calling' || this.state == 'completed') {
                this.state = 'terminated';
                this.app.error(this, error);
            }
        };
            
        this.createAck = function(response) {
            if (!this.request) { 
                throw new String('No transaction request found');
            }
            
            var m = Message.createRequest('ACK', this.request.uri.toString());
            m.setItem("Call-ID", this.request.getItem("Call-ID"));
            m.setItem("From", this.request.getItem("From"));
            m.setItem("To", response ? response.getItem("To") : this.request.getItem("To"));
            m.setItem("Via", this.request.first("Via"));
            m.setItem("CSeq", new sip.Header("" + this.request.getItem("CSeq").number + " ACK", "CSeq")); 
            if (this.request.hasItem("Route")) {
                m.setItem("Route", this.request.getItem("Route"));
            }
            return m;
        };
    }

    sip.InviteClientTransaction = InviteClientTransaction;
    
    
    //--------------------------------------------------------------------------
    // InviteServerTransaction
    //--------------------------------------------------------------------------
    
    function InviteServerTransaction() {
        this.base = sip.Transaction;
        this.base(true);
        delete this.base;
    
        this.start = function() {
            this.state = 'proceeding';
            this.sendResponse(this.createResponse(100, 'Trying'));
            this.app.receivedRequest(this, this.request);
        };
        
        this.receivedRequest = function(request) {
            if (this.request.method == request.method) {
                if (this.state == 'proceeding' || this.state == 'completed') {
                    this.stack.send(this.lastResponse, this.remote, this.transport);
                }
            }
            else if (request.method == 'ACK') {
                if (this.state == 'completed') {
                    this.state = 'confirmed';
                    if (!this.transport.reliable) {
                        this.startTimer('I', this.timer.I());
                    }
                    else {
                        this.timeout('I', 0);
                    }
                }
                else if (this.state == 'confirmed') {
                    // ignore
                }
            }
        };
        
        this.timeout = function(name, timeout) {
            if (this.state == 'completed') {
                if (name == 'G') {
                    this.startTimer('G', Math.min(2*timeout, this.timer.T2));
                    this.stack.send(this.lastResponse, this.remote, this.transport);
                }
                else if (name == 'H') {
                    this.state = 'terminated';
                    this.app.timeout(this);
                }
            }
            else if (this.state == 'confirmed') {
                if (name == 'I') {
                    this.state = 'terminated';
                }
            }
        };
                    
        this.error = function(error) {
            if (this.state == 'proceeding' || this.state == 'trying' || this.state == 'confirmed') {
                this.state = 'terminated';
                this.app.error(this, error);
            }
        };
        
        this.sendResponse = function(response) {
            this.lastResponse = response;
            if (response.is1xx()) {
                if (this.state == 'proceeding' || this.state == 'trying') {
                    this.stack.send(response, this.remote, this.transport);
                }
            }
            else if (response.is2xx()) {
                if (this.state == 'proceeding' || this.state == 'trying') {
                    this.state = 'terminated';
                    this.stack.send(response, this.remote, this.transport);
                }
            }
            else { 
                if (this.state == 'proceeding' || this.state == 'trying') {
                    this.state = 'completed';
                    if (!this.transport.reliable) {
                        this.startTimer('G', this.timer.G());
                    }
                    this.startTimer('H', this.timer.H());
                    this.stack.send(response, this.remote, this.transport);
                }
            }
        };
    }
    
    sip.InviteServerTransaction = InviteServerTransaction;


    //--------------------------------------------------------------------------
    // UserAgent
    //--------------------------------------------------------------------------
    
    function UserAgent(stack, request, server) {
        if (stack !== undefined) {
            this.stack = stack;
            this.request = (request === undefined ? null : request);
            this.server = (server === undefined ? (request !== null) : server);
            this.name = (this.server ? "UAS" : "UAC");
            this.transaction = null;
            this.cancelRequest = null;
            
            this.callId = (request && request.hasItem("Call-ID") ? request.getItem("Call-ID").value : this.stack.getNewCallId());
            this.remoteParty = (request && request.hasItem("From") ? request.getItem("From").value : null);
            this.localParty = (request && request.hasItem("To") ? request.getItem("To").value : null);
            this.localTag = this.stack.tag + Math.floor(10000000000*Math.random());
            this.remoteTag = null;
            this.subject = (request && request.hasItem("Subject") ? request.getItem("Subject").value : null);
            this.secure = (request && request.uri.scheme == "sips" ? true : false);
            this.maxForwards = 70;
            this.routeSet = [];
            this.localTarget = null;
            this.remoteTarget = null;
            this.remoteCandidates = null;
            this.localSeq = 0;
            this.remoteSeq = 0;
            this.contact = new sip.Address(this.stack.uri.toString());
            if (this.localParty && this.localParty.uri.user) {
                this.contact.uri.user = this.localParty.uri.user;
            }
            this.autoack = true;
            this.auth = {};
        }    
    }

    UserAgent.prototype.toString = function() {
        return "<" + this.name + " call-id=" + this.callId + " />";  
    };

    UserAgent.prototype.createTransaction = function(request) {
        return sip.Transaction.createServer(this.stack, this, request, this.stack.transport, this.stack.tag);  
    };
    
    UserAgent.prototype.createRequest = function(method, content, contentType) {
        if (contentType === undefined)
            contentType = null;
        if (content === undefined)
            content = null;
        this.server = false;
        if (!this.remoteParty)
            throw new String("No remoteParty for UAC");
        if (!this.localParty)
            this.localParty = new sip.Address('"Anonymous" <sip:anonymous@anonymous.invalid>');
        var uri = new sip.URI(this.remoteTarget ? this.remoteTarget.toString() : this.remoteParty.uri.toString());
        if (method == 'REGISTER')
            uri.user = null;
        if (!this.secure && uri.secure)
            this.secure = true;
        if (method != 'ACK' && method != 'CANCEL') {
            this.localSeq = this.localSeq + 1;
        }
        
        var To = new sip.Header(this.remoteParty.toString(), 'To');
        To.value.uri.secure = this.secure;
        var From = new sip.Header(this.localParty.toString(), 'From');
        From.value.uri.secure = this.secure;
        From.tag = this.localTag;
        var CSeq = new sip.Header("" + this.localSeq + ' ' + method, 'CSeq')
        var CallId = new sip.Header(this.callId, 'Call-ID');
        var MaxForwards = new sip.Header("" + this.maxForwards, 'Max-Forwards');
        var Via = this.stack.createVia(this.secure);
        Via.branch = sip.Transaction.createBranch([To.value, From.value, CallId.value, CSeq.number], false);

        if (!this.localTarget) {
            this.localTarget = this.stack.uri.dup();
            this.localTarget.user = this.localParty.uri.user;
        }
        var Contact = new sip.Header(this.localTarget.toString(), 'Contact');
        Contact.value.uri.secure = this.secure;
        
        var headers = [To, From, CSeq, CallId, MaxForwards, Via, Contact];
        
        if (this.routeSet) {
            for (var i=0; i<this.routeSet.length; ++i) {
                var route = new sip.Header(this.routeSet[i].toString(), 'Route');
                route.value.uri.secure = this.secure;
                headers.push(route);
            }
        }
        if (contentType) {
            headers.append(new sip.Header(contentType, 'Content-Type'));
        }
        this.request = Message.createRequest(method, uri.toString(), headers, content);
        return this.request
    };

    UserAgent.prototype.createRegister = function(aor) {
        if (aor)
            this.remoteParty = new sip.Address(aor.toString());
        if (!this.localParty)
            this.localParty = new sip.Address(this.remoteParty.toString());
        return this.createRequest('REGISTER');
    };
    
    UserAgent.prototype.sendRequest = function(request) {
        if (!this.request && request.method == 'REGISTER') {
            if (this.transaction && this.transaction.state != 'completed' && this.transaction.state != 'terminated')
                throw new String('Cannot re-REGISTER since pending registration');
        }
        
        this.request = request;
        if (!request.hasItem("Route"))
            this.remoteTarget = request.uri;
        var target = this.remoteTarget;
        
        if (request.hasItem("Route")) {
            var routes = request.all('Route');
            if (routes.length > 0) {
                target = routes[0].value.uri;
                if (!target || target.param['lr'] === undefined) {
                    log('strict route target=', target, 'routes=', routes);
                    routes.shift();
                    if (routes.length > 0) {
                        log('appending our route');
                        routes.append(new sip.Header(request.uri.toString(), 'Route'));
                    }
                    request.setItem("Route", routes);
                    request.uri = target;
                }
            }
        }
        
        this.stack.sending(this, request);
        
        var dest = target.dup();
        dest.port = (target.port ? target.port : (target.secure ? 5061 : 5060));
        if (dest.host == "localhost") {
            this.remoteCandidates = [new sip.URI('sip:127.0.0.1:' + dest.port)]; // no DNS for localhost for testing
            this.tryNextCandidate();
        }
        else if (sip.isIPv4(dest.host)) {
            this.remoteCandidates = [dest];
            this.tryNextCandidate();
        }
        else {
            var this_ = this;
            this.stack.resolve(dest.host, "A", function(host, values) {
                this_.remoteCandidates = sip.map(function(item) { return new sip.URI('sip:' + item.address + ':' + dest.port); }, values);
                this_.tryNextCandidate();
            });
        }
    };
    
    UserAgent.prototype.tryNextCandidate = function() {
        if (!this.remoteCandidates || this.remoteCandidates.length == 0) {
            this.error(null, 'cannot resolve DNS target');
        }
        else {
            target = this.remoteCandidates.shift();
            if (this.request.method != 'ACK') {
                this.transaction = sip.Transaction.createClient(this.stack, this, this.request, this.stack.transport, target.getHostPort());
            }
            else {
                this.stack.send(this.request, target.getHostPort());
            }
        }
    };

    UserAgent.prototype.retryNextCandidate = function() {
        if (!this.remoteCandidates || this.remoteCandidates.length == 0) {
            throw new String('No more DNS resolved address to try');
        }
        var target = new sip.URI(this.remoteCandiates.shift());
        this.request.first('Via').branch += 'A'
        //TODO: this is a bug in rfc3261.py that it should use self.transaction instead of just transaction
        this.transaction = sip.Transaction.createClient(this.stack, this, this.request, this.stack.transport, target.getHostPort());
    };
    
    UserAgent.prototype.canCreateDialog = function(request, response) {
        return response.is2xx() && (request.method == "INVITE" || request.method == "SUBSCRIBE");  
    };
    
    UserAgent.prototype.receivedResponse = function(transaction, response) {
        if (transaction && transaction !== this.transaction) {
            log('Invalid transaction received ' + transaction + " != " + this.transaction);
            return;
        }
        if (response.all('Via').length > 1) {
            throw new String('More than one Via header in response');
        }
        if (response.is1xx()) {
            if (this.cancelRequest) {
                var cancel = sip.Transaction.createClient(this.stack, this, this.cancelRequest, transaction.transport, transaction.remote);
                this.cancelRequest = null;
            }
            else {
                this.stack.receivedResponse(this, response);
            }
        }
        else if (response.response == 401 || response.response == 407) {
            if (!this.authenticate(response, this.transaction)) {
                this.stack.receivedResponse(this, response);
            }
        }
        else {
            if (this.canCreateDialog(this.request, response)) {
                var dialog = sip.Dialog.createClient(this.stack, this.request, response, transaction);
                dialog.autoack = this.autoack;
                this.stack.dialogCreated(dialog, this);
                this.stack.receivedResponse(dialog, response);
                if (dialog.autoack && this.request.method == 'INVITE') {
                    dialog.sendRequest(dialog.createRequest('ACK'));
                }
            }
            else {
                this.stack.receivedResponse(this, response);
            }
        }
    };

    UserAgent.prototype.receivedRequest = function(transaction, request) {
        if (transaction && this.transaction && transaction != this.transaction && request.method != 'CANCEL') {
            throw new String('Invalid transaction for received request');
        }
        this.server = true;
        if (request.uri.scheme != "sip" && request.uri.scheme != "sips") {
            transaction.sendResponse(transaction.createResponse(416, 'Unsupported URI scheme'));
            return;
        }
        if (request.getItem("To")["tag"] === undefined) {
            if (this.stack.findOtherTransaction(request, transaction)) {
                transaction.sendResponse(transaction.createResponse(482, "Loop detected - found another transaction"));
                return;
            }
        }
        
        if (request.hasItem("Require")) {
            if (request.method != 'CANCEL' && request.method != 'ACK') {
                var response = transaction.createResponse(420, 'Bad extension');
                response.setItem("Unsupported", new sip.Header(request.Require.value, 'Unsupported'));
                transaction.sendResponse(response);
                return;
            }
        }
        if (transaction)
            this.transaction = transaction;
        
        if (request.method == 'CANCEL') {
            var original = this.stack.findTransaction(sip.Transaction.createId(transaction.branch, 'INVITE'));
            if (!original) {
                transaction.sendResponse(transaction.createResponse(481, 'Original transaction not found'));
                return;
            }
            if (original.state == 'proceeding' || original.state == 'trying') {
                original.sendResponse(original.createResponse(487, 'Request terminated'));
            }
            transaction.sendResponse(transaction.createResponse(200, 'OK'));
            this.stack.cancelled(this, request);
            return;
        }
            
        this.stack.receivedRequest(this, request);
    };

    UserAgent.prototype.sendResponse = function(response, responsetext, content, contentType, createDialog) {
        if (responsetext === undefined)
            responsetext = null;
        if (content === undefined)
            content = null;
        if (contentType === undefined)
            contentType = null;
        if (createDialog === undefined)
            createDialog = true;
        if (!this.request) {
            throw new String('Invalid request in sending a response');
        }
        if (typeof response == "number") {
            response = this.createResponse(response, responsetext, content, contentType);
        }
        if (createDialog && this.canCreateDialog(this.request, response)) {
            if (this.request.hasItem('Record-Route')) {
                response.setItem('Record-Route', this.request.getItem('Record-Route'));
            }
            if (!response.hasItem("Contact")) { 
                var contact = new sip.Address(this.contact.toString());
                if (!contact.uri.user) {
                    contact.uri.user = this.request.getItem("To").value.uri.user;
                }
                contact.uri.secure = this.secure;
                response.setItem("Contact", new sip.Header(contact.toString(), 'Contact'));
            }
            var dialog = Dialog.createServer(this.stack, this.request, response, this.transaction);
            this.stack.dialogCreated(dialog, this);
            this.stack.sending(dialog, response);
        }
        else {
            this.stack.sending(this, response);
        }
            
        if (!this.transaction) {
            this.stack.send(response, response.first('Via').getViaUri().getHostPort());
        }
        else {
            this.transaction.sendResponse(response);
        }
    };
    
    UserAgent.prototype.createResponse = function(response, responsetext, content, contentType) {
        if (content === undefined)
            content = null;
        if (contentType == undefined)
            contentType = null;
        if (!this.request) {
            throw new String('Invalid request in creating a response');
        }
        response = sip.Message.createResponse(response, responsetext, null, content, this.request);
        if (contentType)
            response.setItem('Content-Type', new sip.Header(contentType, 'Content-Type'));
        if (response.response != 100 && response.getItem("To")["tag"] === undefined)
            response.getItem("To")['tag'] = this.localTag;
        return response;
    };
    
    UserAgent.prototype.sendCancel = function() {
        if (!this.transaction) {
            throw new String('No transaction for sending CANCEL');
        }

        this.cancelRequest = this.transaction.createCancel();
        if (this.transaction.state != 'trying' && this.transaction.state != 'calling') {
            if (this.transaction.state == 'proceeding') {
                var transaction = sip.Transaction.createClient(this.stack, this, this.cancelRequest, this.transaction.transport, this.transaction.remote);
            }
            this.cancelRequest = null;
        }
    };

    UserAgent.prototype.timeout = function(transaction) {
        if (transaction && transaction != this.transaction)
            return;
        this.transaction = null; 
        if (!this.server) {
            if (this.remoteCandidates && this.remoteCandidates.length > 0) {
                this.retryNextCandidate();
            }
            else {
                this.receivedResponse(null, Message.createResponse(408, 'Request timeout', null, null, this.request));
            }
        }
    };
    
    UserAgent.prototype.error = function(transaction, error) {
        if (transaction && transaction != this.transaction)
            return;
        this.transaction = null;
        if (!this.server) {
            if (this.remoteCandidates && this.remoteCandidates.length > 0) {
                this.retryNextCandidate();
            }
            else {
                this.receivedResponse(null, Message.createResponse(503, 'Service unavailable - ' + error, null, null, this.request));
            }
        }
    };

    UserAgent.prototype.authenticate = function(response, transaction) {
        var a = response.first('WWW-Authenticate') || response.first('Proxy-Authenticate') || null;
        if (!a) 
            return false;
        var request = new sip.Message(transaction.request.toString());
        var resend = false;
        var present = false;
        var auths = request.all("Authorization", "Proxy-Authorization");
        for (var i=0; i<auths.length; ++i) {
            var b = auths[i];
            log("handling b=" + b);
            if (a.realm == b.realm && (a.name == 'WWW-Authenticate' && b.name == 'Authorization' || a.name == 'Proxy-Authenticate' && b.name == 'Proxy-Authorization')) {
                present = true;
                break;
            }
        }

        if (!present && a['realm'] !== undefined) {
            var result = this.stack.authenticate(this, a);
            if (!result || a['password'] === undefined && a['hashValue'] === undefined) {
                return false;
            }
            var value = sip.createAuthorization(a.value, a.username, a.password, request.uri.toString(), this.request.method, this.request.body, this.auth);
            if (value) {
                request.insert(new sip.Header(value, (a.name == 'WWW-Authenticate' ? 'Authorization' : 'Proxy-Authorization')), true);
                resend = true;
            }
        }
        
        if (resend) {
            this.localSeq = this.localSeq + 1;
            request.setItem("CSeq", new sip.Header("" + this.localSeq + ' ' + request.method, 'CSeq'));
            request.first('Via').branch = sip.Transaction.createBranch(request, false);
            this.request = request;
            this.transaction = sip.Transaction.createClient(this.stack, this, this.request, this.transaction.transport, this.transaction.remote);
            return true;
        }
        else {
            return false;
        }
    };

    
    sip.UserAgent = UserAgent;


    //--------------------------------------------------------------------------
    // UserAgent
    //--------------------------------------------------------------------------
    
    function Dialog(stack, request, server, transaction) {
        if (transaction === undefined)
            transaction = null;
        this.base = sip.UserAgent;
        this.base(stack, request, server, transaction);
        delete this.base;
        
        this.servers = [];
        this.clients = [];
        this._id = null;
        if (transaction) {
            transaction.app = this;
        }
    }
    
    Dialog.prototype = new sip.UserAgent;
    
    
    // staticmethod
    Dialog.createServer = function(stack, request, response, transaction) {
        var d = new Dialog(stack, request, true);
        d.request = request;
        d.routeSet = (request.hasItem("Record-Route") ? request.all('Record-Route') : null);
        while (d.routeSet && sip.isMulticast(d.routeSet[0].value.uri.host)) {
            log('deleting top multicast routeSet ' + d.routeSet[0]);
            d.routeSet.shift();
            if (d.routeSet.length == 0)
                d.routeSet = null;
        }
        d.secure = request.uri.secure;
        d.localSeq = request.getItem("CSeq").number;
        d.remoteSeq = request.getItem("CSeq").number;
        d.callId = request.getItem('Call-ID').value;
        d.localTag = (response.getItem("To")["tag"] || "");
        d.remoteTag = (response.getItem("From")["tag"] || "");
        d.localParty = new sip.Address(request.getItem("To").value.toString());
        d.remoteParty = new sip.Address(request.getItem("From").value.toString());
        log('request contact ' + request.Contact);
        if (request.hasItem("Contact"))
            d.remoteTarget = new sip.URI(request.first('Contact').value.uri.toString());
        stack.dialogs[d.getId()] = d;
        return d;
    };
    
    // staticmethod
    Dialog.createClient = function(stack, request, response, transaction) {
        var d = new Dialog(stack, request, false);
        d.request = request;
        d.routeSet = (response.hasItem("Record-Route") ? response.all("Record-Route").reverse() : null);
        d.secure = request.uri.secure;
        d.localSeq = request.getItem("CSeq").number;
        d.remoteSeq = 0;
        d.callId = request.getItem('Call-ID').value;
        d.localTag = (response.getItem("From")["tag"] || "");
        d.remoteTag = (response.getItem("To")["tag"] || "");
        d.localParty = new sip.Address(request.getItem("From").value.toString());
        d.remoteParty = new sip.Address(request.getItem("To").value.toString());
        if (response.hasItem("Contact"))
            d.remoteTarget = new sip.URI(response.first('Contact').value.uri.toString());
        stack.dialogs[d.getId()] = d;
        return d;
    };
    
    // staticmethod
    Dialog.extractId = function(m) {
        var callid = m.getItem("Call-ID");
        var from = m.getItem("From");
        var to = m.getItem("To");
        return callid.value + '|' + (m.method ? to['tag'] : from['tag']) + '|' + (m.method ? from['tag'] : to['tag']);
    };
    
    Dialog.prototype.close = function() {
        if (this.stack) {
            var id = this.getId();
            if (this.stack.dialogs[id] !== undefined)
                delete this.stack.dialogs[id];
        }
    };
            
    Dialog.prototype.getId = function() {
        if (!this._id) {
            this._id = this.callId + '|' + this.localTag + '|' + this.remoteTag;
        }
        return this._id;
    };

    Dialog.prototype.createRequest = function(method, content, contentType) {
        var request = sip.UserAgent.prototype.createRequest.apply(this, [method, content !== undefined ? content : null, contentType !== undefined ? contentType : null]);
        if (this.remoteTag)
            request.getItem("To")["tag"] = this.remoteTag;
        if (this.routeSet && this.routeSet.length > 0 && this.routeSet[0].value.uri.param['lr'] === undefined) {
            request.uri = this.routeSet[0].value.uri.dup();
            if (request.uri.param['lr'] !== undefined)
                delete request.uri.param['lr'];
        }
        return request;
    };
    
    Dialog.prototype.createResponse = function(response, responsetext, content, contentType) {
        if (this.servers.length == 0)
            throw new String('No server transaction to create response');
        var request = this.servers[0].request;
        response = sip.Message.createResponse(response, responsetext, null, content !== undefined ? content : null, request);
        if (contentType)
            response.setItem('Content-Type', new sip.Header(contentType, 'Content-Type'));
        if (response.response != 100 && response.getItem("To")["tag"] === undefined)
            response.getItem("To")["tag"] = this.localTag;
        return response;
    };

    Dialog.prototype.sendResponse = function(response, responsetext, content, contentType, createDialog) {
        if (createDialog === undefined)
            createDialog = true;
        if (this.servers.length == 0)
            throw new String('No server transaction to send response');
        this.transaction = this.servers[0];
        this.request = this.servers[0].request;
        sip.UserAgent.prototype.sendResponse.apply(this, [response, responsetext !== undefined ? responsetext : null, content !== undefined ? content : null, contentType !== undefined ? contentType : null, false]);
        var code = typeof response == "number" ? response : response.response;
        if (code >= 200)
            this.servers.shift();
    };

    Dialog.prototype.sendCancel = function() {
        if (this.clients.length == 0) {
            log('No client transaction to send cancel');
            return;
        }
        this.transaction = this.clients[0];
        this.request = this.clients[0].request;
        sip.UserAgent.prototype.sendCancel.apply(this, []);
    };

    Dialog.prototype.receivedRequest = function(transaction, request) {
        if (this.remoteSeq != 0 && request.getItem("CSeq").number < this.remoteSeq) {
            log('Dialog.receivedRequest() CSeq is old ' + request.getItem("CSeq").number + ' < ' + this.remoteSeq);
            this.sendResponse(500, 'Internal server error - invalid CSeq');
            return;
        }
        this.remoteSeq = request.getItem("CSeq").number;
        
        //TODO bug in original code, Contect instead of Contact
        if (request.method == 'INVITE' && request.hasItem("Contact"))
            this.remoteTarget = request.first('Contact').value.uri.dup();
        
        if (request.method == 'ACK' || request.method == 'CANCEL') {
            this.servers = sip.filter(function(item) { return item !== transaction; }, this.servers);
            if (request.method == 'ACK')
                this.stack.receivedRequest(this, request);
            else
                this.stack.cancelled(this, transaction.request);
            return;
        }
        
        this.servers.push(transaction);
        this.stack.receivedRequest(this, request);
    };

    Dialog.prototype.receivedResponse = function(transaction, response) {
        if (response.is2xx() && response.hasItem('Contact') && transaction && transaction.request.method == 'INVITE')
            this.remoteTarget = response.first('Contact').value.uri.dup();
        if (!response.is1xx())
            this.clients = sip.filter(function(item) { return item !== transaction; }, this.clients);
        
        if (response.response == 408 || response.response == 481)
            this.close();
            
        if (response.response == 401 || response.response == 407) {
            if (!this.authenticate(response, transaction))
                this.stack.receivedResponse(this, response);
        }
        else if (transaction) {
            this.stack.receivedResponse(this, response);
        }
        
        if (this.autoack && response.is2xx() && (transaction && transaction.request.method == 'INVITE' || response.getItem("CSeq").method == 'INVITE')) {
            this.sendRequest(this.createRequest('ACK'));
        }
    };
    
    sip.Dialog = Dialog;
    
    

    //--------------------------------------------------------------------------
    // Stack
    //--------------------------------------------------------------------------
    
    // TransportInfo has these attributes: host (str), port (int), type (str: udp/tcp/tls), secure (bool), reliable (bool), congestionControlled (bool).
    function Stack(app, transport, fix_nat) {
        this.tag = "" + Math.ceil(10000000000*Math.random());
        this.app = app;
        this.transport = transport;
        this.fix_nat = (fix_nat !== undefined ? fix_nat : false);
        this.closing = false;
        this.dialogs = {};
        this.transactions = {};
        this.serverMethods = ['INVITE','BYE','MESSAGE','SUBSCRIBE','NOTIFY'];
        this.uri = new sip.URI(((transport.type == 'tls') ? 'sips' : 'sip') + ':' + transport.hostport);
    }
    
    Stack.prototype.close = function() {
        this.closing = true;
        for (var d in this.dialogs) {
            delete this.dialogs[d];
        }
        for (var t in this.transactions) {
            delete this.transactions[t];
        }
        delete this.dialogs;
        delete this.transactions;
    };
    
    Stack.prototype.getNewCallId = function() { 
        return "" + Math.ceil(10000000000*Math.random()) + '@' + (this.transport.host || 'localhost');
    };
    
    Stack.prototype.createVia = function(secure) {
        if (!this.transport)
            throw new String('No transport in stack');
        if (secure && !this.transport.secure)
            throw new String('Cannot find a secure transport');
        //return new sip.Header('SIP/2.0/' + this.transport.type.toUpperCase() + ' ' + this.transport.hostport + (this.transport.type == 'ws' || this.transport.type == 'wss' ? '': ';rport'), 'Via');
        return new sip.Header('SIP/2.0/' + this.transport.type.toUpperCase() + ' ' + this.transport.hostport +';rport', 'Via');
    };

    Stack.prototype.send = function(data, dest, transport) {
        if (dest && (dest instanceof sip.URI)) {
            //TODO: bug in original code, don't use dest.uri.host but use dest.host.
            if (!dest.host)
                throw new String('No host in destination uri');
            dest = [dest.host, dest.port || (this.transport.type == 'tls' || this.transport.secure ? 5061 : 5060)];
        }
        if (data instanceof sip.Message) {
            if (data.method) {
                if (dest && sip.isMulticast(dest[0])) {
                    data.first('Via')['maddr'] = dest[0];
                    data.first('Via')['ttl'] = 1 ;
                }
            }
            else if (data.response) {
                if (!dest) {
                    dest = data.first('Via').getViaUri().getHostPort();
                }
            }
            data = data.toString();
        }
        this.app.send(data, dest, this);
    };
        
    Stack.prototype.received = function(data, src) {
        var m = new sip.Message();
        try {
            m._parse(data);
            var uri = new sip.URI((this.transport.secure ? 'sips' : 'sip') + ':' + src[0].toString() + ':' + src[1]);
            if (m.method) {
                log("received request=" + m.method);
                if (!m.hasItem('Via'))
                    throw new String('No Via header in request');
                var via = m.first('Via');
                if (via.getViaUri().host != src[0] || via.getViaUri().port != src[1]) {
                    via['received'] = src[0];
                    via.getViaUri().host = src[0];
                }
                if (via['rport'] !== undefined) {
                    via['rport'] = src[1];
                    via.getViaUri().port = src[1];
                }
                if (this.fix_nat && (m.method == 'INVITE' || m.method == 'MESSAGE')) {
                    this._fixNatContact(m, src);
                }
                this._receivedRequest(m, uri);
            }
            else if (m.response) {
                log("received response=" + m.response + " " + m.responsetext);
                var cseq = m.getItem("CSeq");
                if (this.fix_nat && cseq && (cseq.method == 'INVITE' || cseq.method == 'MESSAGE')) {
                    this._fixNatContact(m, src);
                }
                this._receivedResponse(m, uri);
            }
            else {
                throw new String('Received invalid message');
            }
        }
        catch (e) {
            // how do we catch only relevant errors?
            log('Error in received message: ' + e);
            if (e.stack !== undefined)
                log(e.stack);
            if (m.method && m.uri && m.protocol && m.method != 'ACK') {
                try {
                    this.send(sip.Message.createResponse(400, "" + e, null, null, m));
                }
                catch (e2) {
                    // ignore
                }
            }
        }
    };
    
    Stack.prototype._fixNatContact = function(m, src) {
        if (m.hasItem('Contact')) { 
            var uri = m.first('Contact').value.uri;
            if ((uri.scheme == 'sip' || uri.scheme == 'sips') && sip.isIPv4(uri.host) && uri.host != src[0] &&
            !sip.isLocal(src[0]) && !sip.isLocal(uri.host) && sip.isPrivate(uri.host) && !isPrivate(src[0])) {
                log('fixing NAT -- private contact from ' + uri);
                uri.host = src[0];
                uri.port = src[1];
                log('to received ' + uri);
            }
        }
    };
                
    Stack.prototype._receivedRequest = function(r, uri) {
        if (!r.hasItem("Via"))
            throw new String('No Via header in received request');
        var branch = r.first("Via")["branch"] !== undefined ? r.first("Via")["branch"] : "";
        var t = null;
        if (r.method == 'ACK') {
            if (branch == '0') {
                t = null;
            }
            else {
                t = this.findTransaction(branch);
                if (!t || t.lastResponse && t.lastResponse.is2xx()) {
                    t = this.findTransaction(sip.Transaction.createId(branch, r.method));
                }
            }
        }
        else {
            t = this.findTransaction(sip.Transaction.createId(branch, r.method));
        }
        
        if (!t) {
            var app = null;
            if (r.method != 'CANCEL' && r.getItem("To")['tag'] !== undefined) {
                log("request has To tag");
                var d = this.findDialog(r);
                if (!d) {
                    log("no exiting dialog found");
                    if (r.method != 'ACK') {
                        log("creating new UAS");
                        var u = this.createServer(r, uri);
                        if (u) {
                            app = u;
                        }
                        else {
                            this.send(sip.Message.createResponse(481, 'Dialog does not exist', null, null, r));
                            return;
                        }
                    }
                    else {
                        log('no dialog for ACK, finding transaction');
                        if (!t && branch != '0') {
                            t = this.findTransaction(sip.Transaction.createId(branch, 'INVITE'));
                        }
                        if (t && t.state != 'terminated') {
                            log('Found transaction ' + t);
                            t.receivedRequest(r);
                            return;
                        }
                        else {
                            log('No existing transaction for ACK');
                            var u = this.createServer(r, uri);
                            if (u) {
                                app = u;
                            }
                            else {
                                log('Ignoring ACK without transaction');
                                return;
                            }
                        }
                    }
                }
                else {
                    log("found existing dialog");
                    app = d;
                }
            }
            else if (r.method != 'CANCEL') {
                log("creating new UAS");
                var u = this.createServer(r, uri);
                if (u) { 
                    app = u;
                }
                else if (r.method == 'OPTIONS') {
                    var m = new sip.Message.createResponse(200, 'OK', null, null, r);
                    m.setItem('Allow', new sip.Header('INVITE, ACK, CANCEL, BYE, OPTIONS', 'Allow'));
                    this.send(m);
                    return;
                }
                else if (r.method != 'ACK') {
                    this.send(sip.Message.createResponse(405, 'Method not allowed', null, null, r));
                    return;
                }
            }
            else {
                log("finding original transaction");
                var o = this.findTransaction(sip.Transaction.createId(r.first('Via')["branch"], 'INVITE'));
                if (!o) { 
                    this.send(sip.Message.createResponse(481, "Original transaction does not exist", null, null, r));
                    return;
                }
                else {
                    app = o.app;
                }
            }
            if (app) {
                log("creating new server transaction");
                t = app.createTransaction(r) ;
                if (r.method == 'ACK' && t && this.transactions[t.id] !== undefined) {
                    delete this.transactions[t.id];
                }
            }
            else if (r.method != 'ACK') {
                log("could not find any app to handle the request");
                this.send(Message.createResponse(404, "Not found", null, null, r));
            }
        }
        else {
            log("found existing transaction");
            if ((t instanceof sip.ServerTransaction) || (t instanceof sip.InviteServerTransaction)) {
                t.receivedRequest(r);
            }
            else {
                log("the transaction was not a server transaction");
                this.send(sip.Message.createResponse(482, 'Loop detected', null, null, r));
            }
        }
    };
        
    Stack.prototype._receivedResponse = function(r, uri) {
        if (!r.hasItem("Via"))
            throw new String('No Via header in received response');
        var branch = r.first("Via")["branch"] !== undefined ? r.first("Via")["branch"] : "";
        var method = r.getItem('CSeq').method;
        var t = this.findTransaction(sip.Transaction.createId(branch, method));
        if (!t) {
            if (method == 'INVITE' && r.is2xx()) {
                var d = this.findDialog(r);
                if (!d)
                    throw new String('No transaction or dialog for 2xx of INVITE');
                else
                    d.receivedResponse(null, r);
            }
            else {
                // TODO: bug in original, don't print the full transaction list, which may be huge.
                log('transaction id ' + sip.Transaction.createId(branch, method) + ' not found');
                if (method == 'INVITE' && r.isfinal()) {
                    var m = sip.Message.createRequest('ACK', r.getItem('To').value.uri.toString());
                    m.setItem('Call-ID', r.getItem('Call-ID'));
                    m.setItem('From', r.getItem('From'));
                    m.setItem('To', r.getItem('To'));
                    m.setItem('Via', r.first('Via'));
                    m.setItem('CSeq', new sip.Header("" + r.getItem("CSeq").number + " ACK", "CSeq"));
                    this.send(m, uri.getHostPort());
                }
                throw new String('No transaction for response');
            }
        }
        else {
            t.receivedResponse(r);
        }
    };
        
    Stack.prototype.createServer = function(request, uri) {
        return this.app.createServer(request, uri, this);
    };
    
    Stack.prototype.sending = function(ua, message) {
        return (this.app['sending'] !== undefined ? this.app.sending(ua, message, this) : null);
    };
    
    Stack.prototype.receivedRequest = function(ua, request) {
        this.app.receivedRequest(ua, request, this);
    };
    
    Stack.prototype.receivedResponse = function(ua, response) {
        this.app.receivedResponse(ua, response, this);
    };
    
    Stack.prototype.cancelled = function(ua, request) {
        this.app.cancelled(ua, request, this);
    };
    
    Stack.prototype.dialogCreated = function(dialog, ua) {
        this.app.dialogCreated(dialog, ua, this);
    };
    
    Stack.prototype.authenticate = function(ua, header) {
        return (this.app['authenticate'] !== undefined ? this.app.authenticate(ua, header, this) : false);
    };
    
    Stack.prototype.createTimer = function(obj) {
        return this.app.createTimer(obj, this);
    };
    
    Stack.prototype.resolve = function(host, type, callback) {
        return this.app.resolve(host, type, callback, this);
    };
    
    Stack.prototype.findDialog = function(arg) {
        var index = (arg instanceof Message ? sip.Dialog.extractId(arg) : arg.toString());
        return (this.dialogs[index] !== undefined ? this.dialogs[index] : null);
    };
    
    Stack.prototype.findTransaction = function(id) {
        return (this.transactions[id] !== undefined ? this.transactions[id] : null);
    };
    
    Stack.prototype.findOtherTransaction = function(r, orig) {
        for (var s in this.transactions) {
            var t = this.transactions[s];
            if (t !== orig && sip.Transaction.equals(t, r, orig))
                return t;
        }
        return null;
    };

    sip.Stack = Stack;

})(sip);

    



//==============================================================================
// rfc2617.py
//==============================================================================



(function(sip){
    
    // sip.quote/unquote are already defined.
    
    sip._testCreateAuthenticate = function() {
        assert(sip.createAuthenticate('Basic', {realm: 'iptel.org'}) == 'Basic realm="iptel.org"', "createAuthenticate('Basic', ...)");
        assert(sip.createAuthenticate('Digest', {realm: 'iptel.org', domain: 'sip:iptel.org', nonce:'somenonce'}) == 'Digest realm="iptel.org", domain="sip:iptel.org", qop="auth", nonce="somenonce", opaque="", stale=FALSE, algorithm=MD5', "createAuthenticate('Digest', ...)");
    };
    
    if (sip['onetime'] === undefined) {
        sip.onetime = "" + Math.random();
    }
    
    sip.createAuthenticate = function(authMethod, attrs) {
        if (authMethod.toLowerCase() == 'basic') {
            return 'Basic realm=' + sip._quote(attrs && attrs['realm'] || '');
        }
        else if (authMethod.toLowerCase() == 'digest') {
            var predef = ['realm', 'domain', 'qop', 'nonce', 'opaque', 'stale', 'algorithm'];
            var unquoted = ['stale', 'algorithm'];
            var now = Math.ceil((new Date()).getTime()/1000);
            var nonce = attrs && attrs['nonce'] || sip.b64_encode("" + now + " " + sip.MD5("" + now + ":" + sip.onetime));
            var def = {realm: '', domain: '', opaque: '', stale: 'FALSE', algorithm: 'MD5', qop: 'auth', nonce: nonce};
            var kv = sip.map(function(x) {return [x, attrs && attrs[x] || def[x]];}, predef);
            for (var k in attrs) {
                if (predef.indexOf(k) < 0) {
                    kv.push([k, attrs[k]]);
                }
            }
            return 'Digest ' + sip.map(function(y) {return y[0] + "=" + (unquoted.indexOf(y[0]) < 0 ? sip._quote(y[1]) : y[1]);}, kv).join(', ');
        }
        else {
            throw new String('invalid auth method ' + authMethod);
        }
    };
    
    sip._testCreateAuthorization = function() {
        var context = {'cnonce':'0a4f113b', 'nc': 0};
        assert(sip.createAuthorization('Digest realm="testrealm@host.com", qop="auth", nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093", opaque="5ccc069c403ebaf9f0171e9517f40e41"', 'Mufasa', 'Circle Of Life', '/dir/index.html', 'GET', null, context)
               == 'Digest cnonce="0a4f113b",nc=00000001,nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",opaque="5ccc069c403ebaf9f0171e9517f40e41",qop=auth,realm="testrealm@host.com",response="6629fae49393a05397450978507c4ef1",uri="/dir/index.html",username="Mufasa"', 'createAuthorization("Digest...")');
        assert(sip.createAuthorization('Basic realm="WallyWorld"', 'Aladdin', 'open sesame') == 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==', "createAuthorization('Basic...')");
    };
    
    sip.createAuthorization = function(challenge, username, password, uri, method, entityBody, context) {
        var parts = sip.str_partition(sip.str_strip(challenge), ' ');
        var authMethod = parts[0];
        var rest = parts[2];
        var ch = {};
        var cr = {username: username, password: password};
        
        if (authMethod.toLowerCase() == 'basic') {
            return authMethod + ' ' + sip.basic(cr);
        }
        else if (authMethod.toLowerCase() == 'digest') {
            if (rest) {
                parts = rest.split(',');
                for (var i=0; i<parts.length; ++i) {
                    var nv = sip.str_partition(sip.str_strip(parts[i]), '=');
                    var n = nv[0];
                    var v = nv[2];
                    ch[sip.str_strip(n.toLowerCase())] = sip._unquote(sip.str_strip(v));
                }
            }
            var attrs = ['username', 'realm', 'nonce', 'opaque', 'algorithm'];
            for (var j=0; j<attrs.length; ++j) {
                var y = attrs[j];
                if (ch[y] !== undefined)
                    cr[y] = ch[y];
            }
            cr['uri'] = uri || null;
            cr['httpMethod'] = method || null;
            if (ch['qop'] !== undefined) {
                var cnonce, nc;
                if (context && context['cnonce'] !== undefined) {
                    cnonce = context['cnonce'];
                    nc = context['nc'] + 1;
                }
                else {
                    cnonce = sip.MD5("" + Math.ceil(10000000000*Math.random()));
                    nc = 1;
                }
                if (context) {
                    context['cnonce'] = cnonce;
                    context['nc'] = nc;
                }
                cr['qop'] = 'auth';
                cr['cnonce'] = cnonce;
                nc = nc.toString(16);
                if (nc.length < 8)
                    nc = '00000000'.substr(0, 8-nc.length) + nc;
                cr['nc'] = nc;
            }
        
            cr['response'] = sip.digest(cr);
            attrs = ['name', 'authMethod', 'value', 'httpMethod', 'entityBody', 'password'];
            var items = [];
            for (var s in cr) {
                if (attrs.indexOf(s) < 0) {
                    items.push(s);
                }
            }
            items.sort();
            return authMethod + ' ' + sip.map(function(y) { return y + '=' + (y == 'qop' || y == 'nc' ? cr[y] : sip._quote(cr[y]));}, items).join(',');
        }
        else {
            throw new String('Invalid auth method -- ' + authMethod);
        }
    };


    sip._testBasicDigest = function() {
        assert(sip.basic({'username':'Aladdin', 'password':'open sesame'}) == 'QWxhZGRpbjpvcGVuIHNlc2FtZQ==', 'basic()');
        
        var input = {'httpMethod':'GET', 'username':'Mufasa', 'password': 'Circle Of Life', 'realm':'testrealm@host.com', 'algorithm':'md5', 'nonce':'dcd98b7102dd2f0e8b11d0f600bfb0c093', 'uri':'/dir/index.html', 'qop':'auth', 'nc': '00000001', 'cnonce':'0a4f113b', 'opaque':'5ccc069c403ebaf9f0171e9517f40e41'};
        assert(sip.digest(input) == '"6629fae49393a05397450978507c4ef1"', "digest()");
    };
    
    sip.digest = function(cr) {
        var algorithm = cr['algorithm'] || null;
        var username = cr['username'] || null;
        var realm = cr['realm'] || null;
        var password = cr['password'] || "";
        var nonce = cr['nonce'] || null;
        var cnonce = cr['cnonce'] || null;
        var nc = cr['nc'] !== undefined ? cr['nc'] : null;
        var qop = cr['qop'] || null;
        var httpMethod = cr['httpMethod'] || null;
        var uri = cr['uri'] || null;
        var entityBody = cr['entityBody'] || null;
          
        var H = function(d) {
            return sip.MD5(d);
        };
        
        var KD = function(s, d) {
            return sip.MD5(s + ':' + d);
        };
        
        var A1, A2;
        if (algorithm && algorithm.toLowerCase() == "md5-sess")
            A1 = H(username + ':' + realm + ':' + password) + ':' + nonce + ':' + cnonce;
        else
            A1 = username + ':' + realm + ':' + password;
        if (!qop || qop == 'auth')
            A2 = httpMethod + ':' + uri.toString();
        else
            A2 = httpMethod + ':' + uri.toString() + ':' + H(entityBody && entityBody.toString() || "");
        if (qop && (qop == 'auth' || qop == 'auth-int')) {
            var a = nonce + ':' + nc.toString() + ':' + cnonce + ':' + qop + ':' + A2;
            return sip._quote(KD(H(A1), nonce + ':' + nc.toString() + ':' + cnonce + ':' + qop + ':' + H(A2)));
        }
        else {
            return sip._quote(KD(H(A1), nonce + ':' + H(A2)));
        }
    };
    
    sip.basic = function(cr) {
        return sip.b64_encode(cr['username'] + ':' + cr['password']);
    };
    

})(sip);

    



//==============================================================================
// rfc4566.py
//==============================================================================



(function(sip){
    
    sip._testSDP = function() {
        var s = "v=0\r\n"
            +   "o=jdoe 2890844526 2890842807 IN IP4 10.47.16.5\r\n"
            +   "s=SDP Seminar\r\n"
            +   "i=A Seminar on the session description protocol\r\n"
            +   "u=http://www.example.com/seminars/sdp.pdf\r\n"
            +   "e=j.doe@example.com (Jane Doe)\r\n"
            +   "c=IN IP4 224.2.17.12/127\r\n"
            +   "t=2873397496 2873404696\r\n"
            +   "a=recvonly\r\n"
            +   "m=audio 49170 RTP/AVP 0\r\n"
            +   "m=video 51372 RTP/AVP 99\r\n"
            +   "a=rtpmap:99 h263-1998/90000\r\n";
        assert((new sip.SDP(s)).toString() == s, "SDP");
    };


    function SDP(value) {
        if (value)
            this._parse(value);
    }
    
    SDP._multiple = 'tramb';
    
    function originator(value) {
        if (value && typeof value == "string") {
            var parts = value.split(' ');
            this.username = parts[0];
            this.sessionid = parseInt(parts[1]);
            this.version = parseInt(parts[2]);
            this.nettype = parts[3];
            this.addrtype = parts[4];
            this.address = parts[5];
        }
        else {
            this.username = "-";
            this.sessionid = Math.ceil((new Date()).getTime() / 1000);
            this.version = Math.ceil((new Date()).getTime() / 1000);
            this.nettype = "IN";
            this.addrtype = "IP4";
            this.address = (value && value["address"] !== undefined ? value["address"] : "127.0.0.1");
        }
    }
    
    originator.prototype.toString = function() {
        return [this.username, this.sessionid.toString(), this.version.toString(), this.nettype, this.addrtype, this.address].join(' ');
    };
    
    SDP.originator = originator;
    
    
    function connection(value) {
        if (value && typeof value == "string") {
            parts = value.split(' ');
            this.nettype = parts[0];
            this.addrtype = parts[1];
            var rest = parts[2].split('/');
            this.address = (rest.length > 0 ? rest[0] : null);
            this.ttl = (rest.length > 1 ? parseInt(rest[1]) : null);
            this.count = (rest.length > 2 ? parseInt(rest[2]) : null);
        }
        else {
            var attrs = ["address", null, "nettype", "IN", "addrtype", "IP4", "ttl", null, "count", null];
            for (var i=0; i<attrs.length; i += 2) {
                var attr = attrs[i];
                var def = attrs[i+1];
                this[attr] = (value && value[attr] !== undefined ? value[attr] : def);
            }
        }
    }
    connection.prototype.toString = function() {
        return this.nettype + ' ' + this.addrtype + ' ' + this.address + (this.ttl === null ? '' : '/' + this.ttl) + (this.count === null ? '' : '/' + this.count);
    };
    
    SDP.connection = connection;
    
    
    
    function media(value) {
        if (value && typeof value == "string") {
            var parts = value.split(' ');
            this.media = parts.shift();
            this.port = parseInt(parts.shift());
            this.proto = parts.shift();
            this.fmt = [];
            for (var i=0; i<parts.length; ++i) {
                var f = parts[i];
                var a = {};
                if (f.match(/^\d+$/)) {
                    a.pt = parseInt(f);
                }
                else {
                    a.pt = f;
                }
                this.fmt.push(a);
            }
        }
        else {
            this.media = (value && value["media"] !== undefined ? value["media"] : null);
            this.port = (value && value["port"] !== undefined ? value["port"] : 0);
            this.proto = (value && value["proto"] !== undefined ? value["proto"] : "RTP/AVP");
            this.fmt = (value && value["fmt"] !== undefined ? value["fmt"] : []);
        }
    }
    
    media.prototype.toString = function() {
        var result = this.media + ' ' + this.port + ' ' + this.proto + ' ' + sip.map(function(item) { return item.pt.toString();}, this.fmt).join(' ');
        var attrs = ['i', 'c', 'b', 'k', 'a'];
        for (var i=0; i<attrs.length; ++i) {
            var k = attrs[i];
            if (this[k] !== undefined) {
                var all = this[k];
                if (SDP._multiple.indexOf(k) < 0) {
                    result += "\r\n" + k + "=" + all.toString();
                }
                else {
                    for (var j=0; j<all.length; ++j) {
                        var v = all[j];
                        result += "\r\n" + k + "=" + v.toString();
                    }
                }
            }
        }
        for (var l=0; l<this.fmt.length; ++l) {
            var f = this.fmt[l];
            if (f["name"] !== undefined) {
                result += "\r\n" + "a=rtpmap:" + f.pt + " " + f.name + "/" + f.rate + (f.params ? '/' + f.params : '');
            }
        }
        return result;
    };
    
    media.prototype.dup = function() {
        var result = new SDP.media({media: this.media, port: this.port, proto: this.proto, fmt: sip.map(function(f) {return {pt: f.pt, name: f.name, rate: f.rate, params: f.params}}, this.fmt)});
        var attrs = ['i', 'c', 'b', 'k', 'a'];
        for (var i=0; i<attrs.length; ++i) {
            var k = attrs[i];
            if (this[k] !== undefined) {
                var all = this[k];
                if (sip.is_array(all)) {
                    result[k] = all.slice();
                }
                else {
                    result[k] = all;
                }
            }
        }
        return result;
    };
    
    SDP.media = media;
    
    
    SDP.prototype._parse = function(text) {
        var g = true;
        var lines = text.replace(/\r\n/g, "\n").split("\n");
        var obj = null;
        for (var i=0; i<lines.length; ++i) {
            var line = lines[i];
            var parts = sip.str_partition(line, "=");
            var k = parts[0];
            var v = parts[2];
            
            if (k == "o")
                v = new SDP.originator(v);
            else if (k == "c")
                v = new SDP.connection(v);
            else if (k == "m")
                v = new SDP.media(v);
            
            if (k == "m") {
                if (this["m"] === undefined) {
                    this["m"] = [];
                }
                this["m"].push(v);
                obj = this["m"][this["m"].length-1];
            }
            else if (this["m"] !== undefined) {
                obj = this["m"][this["m"].length-1];
                if (k == "a" && v.substr(0, 7) == "rtpmap:") {
                    var mparts = v.substr(7).split(' ');
                    var pt = mparts.shift();
                    var rest = mparts.join(' ');
                    mparts = sip.str_partition(rest, '/');
                    var name = mparts[0];
                    rest = mparts[2];
                    mparts = sip.str_partition(rest, '/');
                    var rate = mparts[0];
                    var params = mparts[2];
                    var fall = sip.filter(function(x) {return x.pt.toString() == pt.toString(); }, obj.fmt);
                    for (var j=0; j<fall.length; ++j) {
                        var f = fall[j];
                        f.name = name;
                        f.rate = parseInt(rate);
                        f.params = params || null;
                    }
                }
                else {
                    if (SDP._multiple.indexOf(k) >= 0) {
                        if (obj[k] !== undefined)
                            obj[k].push(v);
                        else
                            obj[k] = [v];
                    }
                    else {
                        obj[k] = v;
                    }
                }
            }
            else {
                obj = this;
                if (SDP._multiple.indexOf(k) >= 0) {
                    if (obj[k] !== undefined)
                        obj[k].push(v);
                    else
                        obj[k] = [v];
                }
                else {
                    obj[k] = v;
                }
            }
        }
    };
    
    SDP.prototype.toString = function() {
        var result = '';
        var attrs = ['v', 'o', 's', 'i', 'u', 'e', 'p', 'c', 'b', 't', 'a', 'm'];
        for (var i=0; i<attrs.length; ++i) {
            var k = attrs[i];
            if (this[k] !== undefined) {
                var all = this[k];
                if (SDP._multiple.indexOf(k) < 0) {
                    result += k + "=" + all.toString() + "\r\n";
                }
                else {
                    for (var j=0; j<all.length; ++j) {
                        var v = all[j];
                        result += k + "=" + v.toString() + "\r\n";
                    }
                }
            }
        }
        return result;
    };
    
    sip.SDP = SDP;

})(sip);

    



//==============================================================================
// rfc3264.py
//==============================================================================



(function(sip){

    sip._testOfferAnswer = function() {
        var audio = new sip.SDP.media({media: "audio", port: 9000});
        audio.fmt = [{pt: 0, name: "PCMU", rate: 8000}, {pt: 8, name: "PCMA", rate: 8000}];
        var video = new sip.SDP.media({media: "video", port: 9002});
        video.fmt = [{pt: 31, name: "H261", rate: 90000}];
        var offer = sip.createOffer([audio, video]);
        
        offer.o.sessionid = 1192000146;
        offer.o.version = 1192000146;
        offer.o.address = '192.168.1.66';
        assert(offer.toString().replace(/\r/g, "\\r").replace(/\n/g, "\\n") == "v=0\\r\\no=- 1192000146 1192000146 IN IP4 192.168.1.66\\r\\ns=-\\r\\nt=0 0\\r\\nm=audio 9000 RTP/AVP 0 8\\r\\na=rtpmap:0 PCMU/8000\\r\\na=rtpmap:8 PCMA/8000\\r\\nm=video 9002 RTP/AVP 31\\r\\na=rtpmap:31 H261/90000\\r\\n", "createOffer()");
        
        var audio2 = new sip.SDP.media({media: "audio", port: 8020});
        audio2.fmt = [{pt: 0}, {pt: 3}];
        var answer = sip.createAnswer([audio2], offer);
        
        answer.o.sessionid = 1192000146;
        answer.o.version = 1192000146;
        answer.o.address = '192.168.1.66';
        assert(answer.toString().replace(/\r/g, "\\r").replace(/\n/g, "\\n") == "v=0\\r\\no=- 1192000146 1192000146 IN IP4 192.168.1.66\\r\\ns=-\\r\\nt=0 0\\r\\nm=audio 8020 RTP/AVP 0\\r\\na=rtpmap:0 PCMU/8000\\r\\nm=video 0 RTP/AVP 31\\r\\na=rtpmap:31 H261/90000\\r\\n", "createAnswer()");
        
        var newOffer = sip.createOffer([audio], offer);
        assert(newOffer.toString().replace(/\r/g, "\\r").replace(/\n/g, "\\n") == "v=0\\r\\no=- 1192000146 1192000147 IN IP4 192.168.1.66\\r\\ns=-\\r\\nt=0 0\\r\\nm=audio 9000 RTP/AVP 0 8\\r\\na=rtpmap:0 PCMU/8000\\r\\na=rtpmap:8 PCMA/8000\\r\\n", "createOffer(revision)");
    };

    sip.createOffer = function(streams, previous, attrs) {
        var s = new sip.SDP();
        s.v = '0';
        if (attrs !== undefined) {
            var params = ['i', 'e', 'p'];
            for (var i=0; i<params.length; ++i) {
                var a = params[i];
                if (attrs[a] !== undefined)
                    s[a] = attrs[a];
            }
        }
        s.o = (previous ? new sip.SDP.originator(previous.o.toString()) : new sip.SDP.originator());
        if (previous)
            s.o.version = s.o.version + 1;
        s.s = "-";
        s.t = ['0 0'];
        s.m = streams;
        return s;
    };

    sip.createAnswer = function(streams, offer, attrs) {
        var s = new sip.SDP();
        s.v = '0';
        if (attrs !== undefined) {
            var params = ['i', 'e', 'p'];
            for (var i=0; i<params.length; ++i) {
                var a = params[i];
                if (attrs[a] !== undefined)
                    s[a] = attrs[a];
            }
        }
        s.o = new sip.SDP.originator();
        s.s = "-";
        s.t = offer.t;
        s.m = [];
        streams = streams.slice();
        for (var j=0; j<offer.m.length; ++j) {
            var your = offer.m[j];
            var my = null;
            var i = 0;
            while (i < streams.length) {
                if (streams[i].media == your.media) {
                    my = streams[i].dup();
                    streams.splice(i, 1);
                    var found = [];
                    for (var y=0; y<your.fmt.length; ++y) {
                        var fy = your.fmt[y];
                        for (var m=0; m<my.fmt.length; ++m) {
                            var fm = my.fmt[m];
                            var fmpt = (typeof fm.pt == "number" ? fm.pt : -1);
                            var fypt = (typeof fy.pt == "number" ? fy.pt : -1);
                            if (fmpt >=0 && fmpt < 32 && fypt >= 0 && fypt < 32 && fmpt == fypt
                            || fmpt<0 && fypt<0 && fm.pt == fy.pt
                            || (""+fm.name).toLowerCase() == (""+fy.name).toLowerCase() && fm.rate == fy.rate && fm.count == fy.count) {
                                found.push([fy, fm]);
                                break;
                            }
                        }
                    }
                    if (found.length > 0) {
                        my.fmt = sip.map(function(item) {return item[0]; }, found);
                    }
                    else {
                        my.fmt = [{pt: 0}];
                        my.port = 0;
                    }
                    break;
                }
                else {
                    ++i;
                }
            }
            if (!my) {
                my = new sip.SDP.media(your.toString());
                my.port = 0;
            }
            s.m.push(my);
        }
        
        var valid = false;
        for (var i=0; i<s.m.length; ++i) {
            my = s.m[i];
            if (my.port != 0) {
                valid = true;
                break;
            }
        }
        return (valid ? s : null);
    };


})(sip);



//==============================================================================
// System Test
//==============================================================================



(function(sip){
    
    function TimerImpl(app) {
        this.app = app;
        this.delay = 0;
        this.running = false;
        this.task = null;
    }
    
    TimerImpl.prototype.start = function(delay) {
        if (this.running)
            this.stop();
        if (delay !== undefined)
            this.delay = delay;
        this.running = true;
        var parent = this;
        this.task = setTimeout(function() { parent.app.timedout.apply(parent.app, [parent]);}, this.delay);
    };
    
    TimerImpl.prototype.stop = function() {
        if (this.running)
            this.running = false;
        if (this.task) {
            clearTimeout(this.task);
            this.task = null;
        }
    };
    
    sip.TimerImpl = TimerImpl;
    
    
    function App(handler) {
        
        this.createServer = function(request, uri, stack) {
            return (request.method != "CANCEL" ? new sip.UserAgent(this, request) : null);
        };
        
        this.sending = function(ua, message, stack) {
            log("sending\n" + message.toString());
        };
        
        this.receivedRequest = function(ua, request, stack) {
            log("received\n" + request.toString());
            handler("request", ua, request);
        };
        
        this.receivedResponse = function(ua, response, stack) {
            log("received\n" + request.toString());
            handler("response", ua, response);
        };
        
        this.cancelled = function(ua, request, stack) {
            log("cancelled");
            handler("cancelled", ua, request);
        };
        
        this.dialogCreated = function(dialog, ua, stack) {
            log("dialog created");
        };
        
        this.authenticate = function(ua, header, stack) {
            return true;
        };
        
        this.createTimer = function(obj, stack) {
            return new sip.TimerImpl(obj);
        };
        
        this.send = function(data, addr, stack) {
            log("send\n" + data);
        }
    }
    
    sip.App = App;
    
    
    function TransportInfo(host, port, type, secure, reliable, congestionControlled) {
        this.host = host || "127.0.0.1";
        this.port = port || (secure ? 5061 : 5060);
        this.type = type || "udp";
        this.hostport = this.host + (port ? ":" + port : "");
        this.secure = secure === undefined ? true : secure;
        this.reliable = reliable === undefined ? true : reliable;
        this.congestionControlled = congestionControlled === undefined ? true : congestionControlled;
    }
    
    sip.TransportInfo = TransportInfo;
    
    
    
    sip._testStack = function() {
        var transport = new sip.TransportInfo("127.0.0.1", 5060, "udp", false, false, false);
        var handler = function() { };
        var app = new sip.App(handler);
        var stack = new sip.Stack(app, transport);
        var ua = new sip.UserAgent(stack);
        ua.localParty = new sip.Address("sip:kundan@iptel.org");
        ua.remoteParty = new sip.Address("sip:kundan@iptel.org");
        ua.remoteTarget = new sip.URI("sip:kundan@127.0.0.1");
        //var register = ua.createRequest("REGISTER");
        //ua.sendRequest(register);
    };
    
})(sip);


    

