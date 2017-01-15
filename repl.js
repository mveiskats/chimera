'use strict';


process.on('SIGINT', function() {
    console.log("Caught interrupt signal");

    if (i_should_exit)
        process.exit();
});


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
