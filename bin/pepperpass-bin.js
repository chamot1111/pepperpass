/// <reference path="../typings/tsd.d.ts" />
var minimist = require('minimist');
var copypaste = require('copy-paste');
var jssha = require('jssha');
var _ = require('underscore');
var prompt = require('prompt');
var url = require('url');
var Encoder = (function () {
    function Encoder(pass, identifier) {
        this.pass = pass;
        this.identifier = identifier;
    }
    Encoder.prototype.getTextToHash = function () {
        return this.identifier + ':' + this.pass;
    };
    Encoder.prototype.getPass = function () {
        var shaObj = new jssha("SHA-512", "TEXT");
        shaObj.update(this.getTextToHash());
        var hash = shaObj.getHash("B64");
        return hash.substr(0, 23);
    };
    return Encoder;
})();
function areParamsCorrects(argv) {
    var u = argv.u, i = argv.i;
    return ((u != null) || (i != null)) && (_.keys(argv).length == 2);
}
function parseIdentifierFromURL(aUrl) {
    var hostname = url.parse(aUrl).hostname;
    if (hostname == null) {
        console.error('The url "' + aUrl + '" is not a valid url');
        process.exit(1);
    }
    return hostname;
}
function parseIdentifierFromArgv() {
    var startSlice = (process.argv[0] == 'node') ? 2 : 1;
    var argv = minimist(process.argv.slice(startSlice));
    if (!areParamsCorrects(argv)) {
        console.log('usage: pepperpass [-u url] [-i identifier]');
        console.log('       -u: use an url as identifier');
        console.log('       -i: use a raw identifier as salt word');
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
console.log("Beta version");
var identifier = parseIdentifierFromArgv();
console.log("identifier: " + identifier);
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
    var e = new Encoder(identifier, result.password);
    copypaste.copy(e.getPass(), function (aText) {
        console.log("encrypted password have been copied into clipboard");
        process.exit(0);
    });
});
//# sourceMappingURL=pepperpass-bin.js.map