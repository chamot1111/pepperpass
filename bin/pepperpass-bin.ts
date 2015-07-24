/// <reference path="../typings/tsd.d.ts" />

import minimist  = require('minimist');
import copypaste = require('copy-paste');
import jssha     = require('jssha');
import _         = require('underscore');
import prompt    = require('prompt');
import url       = require('url');

class Encoder {
    pass: string;
    identifier: string;

    constructor(pass: string, identifier: string) {
        this.pass = pass;
        this.identifier = identifier;
    }

    getTextToHash(): string {
      return this.identifier + ':' + this.pass;
    }

    getPass(): string {
      var shaObj = new jssha("SHA-512", "TEXT");
      shaObj.update(this.getTextToHash());
      var hash = shaObj.getHash("B64");
      return hash.substr(0, 23);
    }
}

function areParamsCorrects(argv: any): boolean {
  // { _: [], u: 'toto' }
  // { _: [], i: 'toto' }
  let {u, i} = argv;
  return ((u != null) || (i != null)) && (_.keys(argv).length == 2);
}

function parseIdentifierFromURL(aUrl: string): string {
  let {hostname} = url.parse(aUrl);
  if(hostname == null) {
    console.error('The url "' + aUrl + '" is not a valid url');
    process.exit(1);
  }
  return hostname;
}

function parseIdentifierFromArgv(): string {
  let startSlice = (process.argv[0] == 'node')? 2 : 1;
  let argv: any = minimist(process.argv.slice(startSlice));

  if(!areParamsCorrects(argv)) {
    console.log('usage: pepperpass [-u url] [-i identifier]');
    console.log('       -u: use an url as identifier');
    console.log('       -i: use a raw identifier as salt word');
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

console.log("Beta version");

let identifier = parseIdentifierFromArgv();

console.log("identifier: " + identifier);

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

      var e: Encoder = new Encoder(identifier, result.password);
      copypaste.copy(e.getPass(), function(aText: string) {
          console.log("encrypted password have been copied into clipboard");
          process.exit(0);
        });

  });
