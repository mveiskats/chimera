'use strict';

const immutable = require('immutable');

const write = require('./write.js');

module.exports = evaluate;

function isLiteral(expr) {
  return ((expr === null) ||
          ('string' === typeof(expr)) ||
          ('number' === typeof(expr)) ||
          ('boolean' === typeof(expr)));
}

function evaluate(scope, expr) {
  if (isLiteral(expr))
    return expr;
  else if ('symbol' === typeof(expr)) {
    if (undefined === scope.get(expr))
      throw Symbol.keyFor(expr) + ' is not defined';

    return scope.get(expr);

  } else if (immutable.List.isList(expr)) {
    if (expr.isEmpty())
      throw 'Cannot evaluate empty list';

    var name = expr.first();
    var args = expr.rest();

    var f = evaluate(scope, name);

    if (!f.isSpecial)
      args = args.map((a) => evaluate(scope, a));

    if ('function' !== typeof(f))
      throw write(name) + ' is not a function!';

    return f(scope, ...args);
  } else {
    throw "Don't know how to evaluate " + write(expr);
  }
}
