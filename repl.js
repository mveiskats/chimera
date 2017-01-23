'use strict';

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");

  if (i_should_exit)
    process.exit();
});

const SourceStream = require('./source-stream.js');
const read = require('./read.js');
const write = require('./write.js');
const evaluate = require('./evaluate.js');
const Scope = require('./scope.js');

const readline = require('readline');

var globalScope = new Scope

function repl() {
  var input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '()> '
  });

  var eos = Symbol();

  input.prompt();

  input.on('line', (line) => {
    try {
      var expr = read(new SourceStream(line), eos);
      if (expr !== eos) {
        var result = evaluate(globalScope, expr);
        console.log(write(result));
      }
    } catch (err) {
      console.error(err);
    }
    input.prompt();
  });
}

repl();
