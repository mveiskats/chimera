'use strict';

const immutable = require('immutable');

const util = require('./util.js');

module.exports = write

function write(atom) {
  if (null === atom) return 'null';
  if ('symbol' === typeof(atom)) return util.symbolName(atom);
  if (atom instanceof immutable.List) return writeList(atom);
  if ('string' === typeof(atom)) return "'" + atom + "'";
  return atom.toString();
}

function writeList(l) {
  return '(' + l.map((a) => write(a)).join(' ') + ')';
}
