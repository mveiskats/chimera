'use strict';

const read = require('./read.js');
const write = require('./write.js');
const evaluate = require('./evaluate.js');
const Scope = require('./scope.js');

const readline = require('readline');

var globalScope = new Scope({
  set: function(scope, name, value) {
    return scope.set(name, value);
  },
  fn: function(scope, args, ...body) {
    return function() {
      var result;
      for (var expr in body)
        result = evaluate(expr, scope);

      return result;
    }
  }
});

function repl() {
  var input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '()> '
  });

  input.prompt();

  input.on('line', (line) => {
    try {
      console.log(write(evaluate(read(line), globalScope)));
    } catch (err) {
      console.error(err);
    }
    input.prompt();
  });
}

repl();
