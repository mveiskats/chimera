'use strict';

const fs = require('fs');

const SourceStream = require('./source-stream.js');
const read = require('./read.js');
const write = require('./write.js');
const evaluate = require('./evaluate.js');
const Scope = require('./scope.js');

var globalScope = new Scope

for (var i = 2; i < process.argv.length; i++) {
  var input = new SourceStream(fs.readFileSync(process.argv[i], 'utf8'));
  var eos = Symbol();

  while(!input.eos()) {
    var expr = read(input, eos);

    if (expr !== eos)
      evaluate(globalScope, expr);
  }
}
