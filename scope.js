'use strict';

module.exports = Scope;

const immutable = require('immutable');

const SourceStream = require('./source-stream.js');
const read = require('./read.js');
const write = require('./write.js');
const evaluate = require('./evaluate.js');

function isEqual(a, b) {
  var listEqual = function(l1, l2) {
    return l1.every((item, idx) => isEqual(item, l2.get(idx)));
  };

  // Should list comparision even be here?
  return (a === b) ||
    (immutable.List.isList(a) &&
     immutable.List.isList(b) &&
     a.size === b.size &&
     listEqual(a, b));
}
var defaultBindings = {};

function defFn(name, fn) {
  return defaultBindings[Symbol.for(name)] = fn;
}

function defSpecial(name, fn) {
  var result = defFn(name, fn);
  result.isSpecial = true;
  return result;
}

defSpecial('set', function(scope, name, value) {
  return scope.set(name, evaluate(scope, value));
});

defSpecial('fn', function(lexicalScope, argNames, ...body) {
  return function(dynamicScope, ...argValues) {
    // Bind arguments
    var localScope = new Scope(dynamicScope);
    for (var i = 0; i < argNames.size; i++)
      localScope.set(argNames.get(i), argValues[i]);

    var result;
    for (var expr of body)
      result = evaluate(localScope, expr);

    return result;
  }
});

defSpecial('if', function(scope, condition, thenClause, elseClause) {
  if (evaluate(scope, condition))
    return evaluate(scope, thenClause);
  else
    return evaluate(scope, elseClause);
});

defSpecial('quote', function(scope, expr) { return expr; });

defFn('read', function(scope, str) { return read(new SourceStream(str)); });
defFn('write', function(scope, expr) { return write(expr); });

defFn('print', function(scope, str) {
  str = str.toString();
  process.stdout.write(str); return str;
});

// TODO: only evaluate arguments up to first inequality
defFn('=', function(scope, first, ...rest) {
  return rest.every(function(elem) { return isEqual(first, elem) });
});

defFn('not', function(scope, val) { return !val; });

defFn('or', function(scope, ...values) {
  return values.some(function(val) { return val });
});

defFn('and', function(scope, ...values) {
  return values.every(function(val) { return val });
});

defFn('list', function(scope, ...values) {
  return immutable.List(values);
});

function Scope(parent = null) {
  this._bindings = Object.create(parent && parent._bindings || defaultBindings);
}

Scope.prototype.get = function(name) {
  return this._bindings[name];
}

Scope.prototype.set = function(name, value) {
  return this._bindings[name] = value;
}
