'use strict';

module.exports = read;

const immutable = require('immutable');
const SourceStream = require('./source-stream.js');
const sourceError = require('./source-error.js')

const whitespace = ' \t\n';
const nonConstituents = '()"';

// TODO: use unicode character properties?
function isWhitespace(ch) {
  return whitespace.includes(ch)
}

function isConstituent(ch) {
  return !nonConstituents.includes(ch);
}

var readMacros = {
  '"': readString,
  '(': readList,
  ')': function(input, _) { sourceError(input, "Unexpected ')'"); }
}

function read(input, eosValue) {
  while(true) {
    if (input.eos()) return eosValue;

    var ch = input.peek();

    if (isWhitespace(ch))
      input.read();
    else if (readMacros[ch])
      return readMacros[ch](input, input.read());
    else
      return readToken(input);
  }
}

function skipWhitespace(input) {
  while(isWhitespace(input.peek())) {
    input.read();
  }
}

function readToken(input) {
  var atom = '';
  var ch;
  while((ch = input.peek()) && !isWhitespace(ch) && ch !== ')')
    atom += input.read();

  var intPattern = /^-?\d+$/;
  if (atom.match(intPattern)) return parseInt(atom);
  if('nil' === atom) return null;
  if('true' === atom) return true;
  if('false' === atom) return false;
  return Symbol.for(atom);
}

function readList(input, macroChar) {
  var result = [];

  while(true) {
    if (input.eos()) throw 'Unexpected end of stream';

    var ch = input.peek();

    if (')' === ch) {
      input.read(); // closing char
      return new immutable.List(result);
    }

    if (isWhitespace(ch))
      input.read();
    else
      result.push(read(input));
  }
}

function readString(input, macroChar) {
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

  while(macroChar !== input.peek()) {
    if (null === input.peek())
      throw 'Unexpected end of stream';

    var ch = input.read();
    if (ch === '\\') {
      ch = input.read();
      if (null === ch)
        throw 'Unexpected end of stream';

      result += (null !== escapes[ch] ? escapes[ch] : ch)
    } else {
      result += ch;
    }
  }

  input.read(); // closing char

  return result;
}
