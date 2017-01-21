'use strict';

module.exports = readFromString;

const immutable = require('immutable');
const util = require('./util.js');

const whitespace = ' \t\n';

// TODO: use unicode character properties?
function isWhitespace(ch) {
  return whitespace.includes(ch)
}

function readFromString(str) {
  return read(new util.SyncStream(str));
}

function read(input) {
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

    result.push(read(input));
    skipWhitespace(input);
  }

  input.read(); // closing bracket

  return new immutable.List(result);
}

function readString(input) {
  input.read(); // opening apostrophe
  var result = '';

  const escapes = {
    'b': '\b',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t',
    'v': '\v',
    '0': '\0',
    '\'': '\'',
    '"': '"',
    '\\': '\\'
  }

  while("'" !== input.peek()) {
    if (null === input.peek())
      throw 'Unexpected end of stream';

    var ch = input.read();
    if (ch === '\\') {
      ch = input.read();
      if (null === ch)
        throw 'Unexpected end of stream';

      result += (null !== escapes[ch] ? escapes[ch] : ch)
    } else {
      result += input.read();
    }

  }

  input.read(); // closing apostrophe

  return result;
}
