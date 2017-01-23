'use strict';

module.exports = function(input, msg) {
  throw input.row + ':' + input.col + ': ' + msg;
}
