/// <reference path="../typings/tsd.d.ts" />
var minimist = require('minimist');
var copypaste = require('copy-paste');
var jssha = require('jssha');
var _ = require('underscore');
var prompt = require('prompt');
var url = require('url');
var startSlice = (process.argv[0] == 'node') ? 2 : 1;
var argv = minimist(process.argv.slice(startSlice));
var Encoder = (function () {
    function Encoder() {
        this.length = 23;
        this.alphaNumericRestrict = false;
    }
    Encoder.prototype.getTextToHash = function () {
        return this.identifier + ':' + this.pass;
    };
    Encoder.prototype.getPass = function () {
        var shaObj = new jssha("SHA-512", "TEXT");
        shaObj.update(this.getTextToHash());
        var hash = shaObj.getHash("B64");
        if (this.alphaNumericRestrict) {
            hash = hash.replace('/', 'a');
            hash = hash.replace('+', 'b');
        }
        return hash.substr(0, this.length);
    };
    return Encoder;
})();
function areParamsCorrects(argv) {
    var u = argv.u, i = argv.i;
    var mandatoryCount = _.size(_.chain(argv)
        .keys()
        .filter(function (k) { return _.contains(['u', 'i'], k); })
        .value());
    var unknownParametersCount = _.size(_.chain(argv)
        .keys()
        .reject(function (k) { return _.contains(['u', 'i', 'l', 'r', '_'], k); })
        .value());
    return mandatoryCount == 1 && unknownParametersCount == 0;
}
function parseIdentifierFromURL(aUrl) {
    var hostname = url.parse(aUrl).hostname;
    if (hostname == null) {
        console.error('The url "' + aUrl + '" is not a valid url');
        process.exit(1);
    }
    return hostname;
}
function PrintUsage() {
    console.log('usage: pepperpass [-u url] [-i identifier]');
    console.log('       -u: use an url as identifier');
    console.log('       -i: use a raw identifier as salt word');
    console.log('       -r: restrict caracters to [a-Z0-9]');
    console.log('       -l: length (default 23)');
}
function parseIdentifierFromArgv() {
    if (!areParamsCorrects(argv)) {
        PrintUsage();
        process.exit(1);
    }
    var u = argv.u, i = argv.i;
    if (i != null) {
        return i;
    }
    else if (u != null) {
        return parseIdentifierFromURL(u);
    }
    else {
        process.exit(1);
    }
}
var e = new Encoder();
var l = argv.l, r = argv.r;
if (l != null) {
    e.length = parseInt(l);
    if (isNaN(e.length)) {
        PrintUsage();
        process.exit(1);
    }
}
if (r != null) {
    e.alphaNumericRestrict = true;
}
;
console.log("Beta version");
e.identifier = parseIdentifierFromArgv();
console.log("identifier: " + e.identifier);
prompt.message = "";
prompt.delimiter = "";
prompt.start();
prompt.get([{
        name: 'password',
        hidden: true,
        conform: function (value) {
            return true;
        }
    }], function (err, result) {
    if (err != null) {
        console.error(err);
        process.exit(1);
    }
    e.pass = result.password;
    copypaste.copy(e.getPass(), function (aText) {
        console.log("encrypted password have been copied into clipboard");
        process.exit(0);
    });
});
//# sourceMappingURL=pepperpass-bin.js.map