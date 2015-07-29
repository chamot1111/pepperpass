/// <reference path="../typings/tsd.d.ts" />

import minimist  = require('minimist');
import copypaste = require('copy-paste');
import jssha     = require('jssha');
import _         = require('underscore');
import prompt    = require('prompt');
import url       = require('url');

let startSlice = (process.argv[0] == 'node')? 2 : 1;
let argv: any = minimist(process.argv.slice(startSlice));

class Encoder {
    pass: string;
    identifier: string;
    length: number;
    alphaNumericRestrict: boolean;

    constructor() {
      this.length = 23;
      this.alphaNumericRestrict = false;
    }

    getTextToHash(): string {
      return this.identifier + ':' + this.pass;
    }

    getPass(): string {
      var shaObj = new jssha("SHA-512", "TEXT");
      shaObj.update(this.getTextToHash());
      var hash = shaObj.getHash("B64");
      if(this.alphaNumericRestrict) {
        hash = hash.replace('/', 'a');
        hash = hash.replace('+', 'b');
      }
      return hash.substr(0, this.length);
    }
}

function areParamsCorrects(argv: any): boolean {
  // { _: [], u: 'toto' }
  // { _: [], i: 'toto' }
  let {u, i} = argv;
  let mandatoryCount = _.size(_.chain(argv)
              .keys()
              .filter(function(k: string) { return _.contains(['u', 'i'], k) })
              .value());
  let unknownParametersCount = _.size(_.chain(argv)
              .keys()
              .reject(function(k: string) { return _.contains(['u', 'i', 'l', 'r', '_'], k)})
              .value());
  return mandatoryCount == 1 && unknownParametersCount == 0;
}

function parseIdentifierFromURL(aUrl: string): string {
  let {hostname} = url.parse(aUrl);
  if(hostname == null) {
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

function parseIdentifierFromArgv(): string {

  if(!areParamsCorrects(argv)) {
    PrintUsage();
    process.exit(1);
  }

  let {u, i} = argv;

  if(i != null) {
    return i;
  } else if (u != null) {
    return parseIdentifierFromURL(u);
  } else {
    process.exit(1);
  }
}

var e: Encoder = new Encoder();

let {l, r} = argv;

if(l != null) {
  e.length = parseInt(l);
  if(isNaN(e.length)) {
    PrintUsage();
    process.exit(1);
  }
}
if (r != null) {
  e.alphaNumericRestrict = true;
};

console.log("Beta version");
e.identifier = parseIdentifierFromArgv();

console.log("identifier: " + e.identifier);

prompt.message = "";
prompt.delimiter = "";
prompt.start();

prompt.get([{
      name: 'password',
      hidden: true,
      conform: function (value: string): boolean {
        return true;
      }
    }], function (err: any, result: any) {
      if(err != null) {
        console.error(err);
        process.exit(1);
      }
      e.pass = result.password;
      copypaste.copy(e.getPass(), function(aText: string) {
          console.log("encrypted password have been copied into clipboard");
          process.exit(0);
        });

  });
