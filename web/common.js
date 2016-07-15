
function $(name) {
    return document.getElementById(name);
}
function $$(selector) {
    return document.querySelector(selector);
}

function log(msg, type) {
    var log_text = $("log-text");
    if (log_text) {
        log_text.value += "\n" + msg;
        if (phone && phone.log_scroll)
            log_text.scrollTop = log_text.scrollHeight;
    } 
    if (typeof console != "undefined" && console.log !== undefined) {
        console.log(msg);
    }
};

function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}

function ab2str(buf) {
    var s = String.fromCharCode.apply(null, new Uint8Array(buf));
    return decode_utf8(decode_utf8(s))
}

function str2ab(str) {
    var s = encode_utf8(str)
    var buf = new ArrayBuffer(s.length); 
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=s.length; i<strLen; i++) {
        bufView[i] = s.charCodeAt(i);
    }
    return buf;
}

//function string2arraybuffer(string, callback) {
//    var bb = new Blob([string]);
//    var f = new FileReader();
//    f.onload = function(e) {
//        callback(e.target.result);
//    }
//    f.readAsArrayBuffer(bb.getBlob());
//}
//
//function arraybuffer2string(buf, callback) {
//    var bb = new UintArray(buf);
//    var f = new FileReader();
//    f.onload = function(e) {
//        callback(e.target.result)
//    }
//    f.readAsText(bb);
//}
