'use strict';

module.exports = Scope;

function Scope(b = {}) {
  this.bindings = {};

  for (var key in b) {
    var val = b[key];

    if ('string' === typeof(key))
      key = Symbol.for(key);

    this.bindings[key] = val;
  }
}

Scope.prototype.get = function(name) {
  return this.bindings[name];
}

Scope.prototype.set = function(name, value) {
  return this.bindings[name] = value;
}
