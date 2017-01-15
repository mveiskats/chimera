'use strict';

module.exports = read;

const immutable = require('immutable');

const whitespace = ' \t\n';

function isWhitespace(ch) {
  return whitespace.includes(ch)
}

// TODO: implement for stream reading?
class SyncStream {
  constructor(str) {
    this._input = str
    this.pos = 0;
    this.row = 0;
    this.col = 0;
  }

  peek() {
    if(this.pos >= this._input.length)
      return null;
    else
      return this._input[this.pos];
  }

  read() {
    if(this.pos >= this._input.length)
      return null;
    else
      return this._input[this.pos++];
  }

  eos() {
    return this.pos >= this._input.length;
  }
}

function read(str) {
  var input = new SyncStream(str);

  if (!input.eos())
  {
    if('(' === input.peek())
      return readList(input);
    else if("'" === input.peek())
      return readString(input);
    else
      return readAtom(input);
  }
}

function skipWhitespace(input) {
  while(isWhitespace(input.peek())) {
    input.read();
  }
}

function readAtom(input) {
  var atom = '';
  var ch;
  while((ch = input.peek()) && !isWhitespace(ch) && ch !== ')')
    atom += input.read();

  var intPattern = /^\d+$/;
  if (atom.match(intPattern)) return parseInt(atom);
  if('nil' === atom) return null;
  if('true' === atom) return true;
  if('false' === atom) return false;
  return Symbol.for(atom);
}

function readList(input) {
  input.read(); // opening bracket
  var result = [];
  skipWhitespace(input);

  while(')' !== input.peek()) {
    if (null === input.peek())
      throw 'Unexpected end of stream';

    result.push(readAtom(input));
    skipWhitespace(input);
  }

  input.read(); // closing bracket

  return new immutable.List(result);
}

function readString(input) {
  input.read(); // opening apostrophe
  var result = '';

  while("'" !== input.peek()) {
    if (null === input.peek())
      throw 'Unexpected end of stream';

    result += input.read();
  }

  input.read(); // closing apostrophe

  return result;
}
