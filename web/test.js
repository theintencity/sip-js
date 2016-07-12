function log(msg) {
    if (typeof console != "undefined")
        console.log(msg);
}

function AssertException(message) {
    this.message = message;
}

AssertException.prototype.toString = function() {
    return 'AssertException: ' + this.message;
}

function assert(exp, message) {
    if (!exp) {
        throw new AssertException(message);
    }
}

function testModule(module) {
    var failed = 0;
    var passed = 0;
    for (var s in module) {
        if (s.substr(0, 5) == "_test" && typeof module[s] == "function") {
            try {
                module[s].apply(module);
                passed += 1;
            }
            catch (e) {
                log(s + ": " + e.toString());
                if (e["stack"] !== undefined) {
                    log(e.stack);
                }
                failed += 1;
            }
        }
    }
    log("test passed: " + passed + ", failed: " + failed);
}