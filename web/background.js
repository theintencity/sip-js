chrome.app.runtime.onLaunched.addListener(function(data) {
  console.log(data);
  var target = null;
  if (data && data.source == "url_handler" && data.id == "sip_js") {
    var match = data.url.match(/\?target=(.*)$/);
    if (match && match[1]) {
      target = decodeURIComponent(match[1]);
    }
  }
  
  var win = (chrome.app.window.get ? chrome.app.window.get("sip_js") : null);
  if (win) {
    if (target) {
      win.contentWindow.dialout(target);
    }
  } else {
    chrome.app.window.create("index.html" + (target ? "?target=" + encodeURIComponent(target) : ""), {
      'id': 'sip_js',
      'innerBounds': { 'width': 1020, 'height': 510 }
    });
  }
});
