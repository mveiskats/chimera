'use strict';

module.exports = Scope;

const read = require('./read.js');
const write = require('./write.js');
const evaluate = require('./evaluate.js');

var defaultBindings = symbolizeKeys({
  set: function(scope, name, value) {
    return scope.set(name, evaluate(scope, value));
  },
  fn: function(scope, args, ...body) {
    return function() {
      var result;
      for (var expr of body)
        result = evaluate(scope, expr);

      return result;
    }
  },
  read: function(scope, str) {
    return read(str);
  },
  write: function(scope, expr) {
    return write(expr);
  },
  '=': function(scope, arg1, ...argn) {
    for(var i = 0; i < argn.length; i++)
      if (arg1 !== argn[i]) return false;

    return true;
  },
  if: function(scope, condition, thenClause, elseClause) {
    if (evaluate(scope, condition))
      return evaluate(scope, thenClause);
    else
      return evaluate(scope, elseClause);
  }
});

function symbolizeKeys(obj) {
  var result = {};

  for (var key in obj) {
    var val = obj[key];

    if ('string' === typeof(key))
      key = Symbol.for(key);

    result[key] = val;
  }

  return result;
}

function Scope(b = {}) {
  // TODO: inherit instead of exposing directly
  this.bindings = defaultBindings;

}

Scope.prototype.get = function(name) {
  return this.bindings[name];
}

Scope.prototype.set = function(name, value) {
  return this.bindings[name] = value;
}
