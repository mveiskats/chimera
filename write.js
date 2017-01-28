'use strict';

const immutable = require('immutable');

module.exports = write

function write(atom) {
  if (null === atom) return 'nil';
  if ('symbol' === typeof(atom)) return Symbol.keyFor(atom);
  if (atom instanceof immutable.List) return writeList(atom);
  if ('string' === typeof(atom)) return '"' + atom + '"';
  return atom.toString();
}

function writeList(l) {
  return '(' + l.map((a) => write(a)).join(' ') + ')';
}
