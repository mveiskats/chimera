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

var defineFn = defSpecial('def', function(scope, name, value) {
  return scope.define(name, evaluate(scope, value));
});

defSpecial('set', function(scope, name, value) {
  return scope.set(name, evaluate(scope, value));
});

var doFn = defSpecial('do', function(scope, ...body) {
  var result;
  for (var expr of body)
    result = evaluate(scope, expr);

  return result;
});

defSpecial('let', function(scope, bindings, ...body) {
  var nestedScope = new Scope(scope);
  if (!immutable.List.isList(bindings) || bindings.size % 2 === 1)
    throw 'Invalid bindings - ' + write(bindings);

  for(var i = 0; i < bindings.size; i += 2)
    defineFn(nestedScope,
             bindings.get(i),
             evaluate(scope, bindings.get(i + 1)));

  return doFn(nestedScope, ...body);
});

defSpecial('fn', function(lexicalScope, argNames, ...body) {
  return function(dynamicScope, ...argValues) {
    // Bind arguments
    var nestedScope = new Scope(dynamicScope);
    for (var i = 0; i < argNames.size; i++)
      nestedScope.define(argNames.get(i), argValues[i]);

    return doFn(nestedScope, ...body);
  }
});

defSpecial('if', function(scope, condition, thenClause, elseClause) {
  if (evaluate(scope, condition))
    return evaluate(scope, thenClause);
  else
    return evaluate(scope, elseClause);
});

defSpecial('quote', function(scope, expr) { return expr; });

defSpecial('while-do', function(scope, condition, ...body) {
  var result = null;
  while(evaluate(scope, condition))
    result = doFn(scope, ...body);

  return result;
});

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

defFn('+', function(scope, ...values) {
  return values.reduce(function(a, b) { return a + b; }, 0);
});

defFn('-', function(scope, minuend, ...subtrahends) {
  if (0 === subtrahends.length)
    return -minuend;
  else
    return subtrahends.reduce(function(a, b) { return a - b; }, minuend);
});

function Scope(parent = null) {
  this._parent = parent;
  this._bindings = parent ? {} : defaultBindings;
}

Scope.prototype.define = function(name, value) {
  if (this._bindings[name])
    throw Symbol.keyFor(name) + ' is already defined'

  return this._bindings[name] = value;
}

Scope.prototype.get = function(name) {
  var val = this._bindings[name];

  if (undefined === val) {
    if (!this._parent)
      throw Symbol.keyFor(name) + ' is not defined';

    return this._parent.get(name);
  }

  return val;
}

Scope.prototype.set = function(name, value) {
  var oldVal = this._bindings[name];

  if (undefined === oldVal) {
    if (!this._parent)
      throw Symbol.keyFor(name) + ' is not defined';

    return this._parent.set(name, value)
  }

  return this._bindings[name] = value;
}
