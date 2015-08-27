(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part === '..') {
          results.pop();
        } else if (part !== '.' && part !== '') {
          results.push(part);
        }
      }
      return results.join('/');
    };
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require = require;
})();
require.register("__lib/atom", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var Atom = {};

Atom.__MODULE__ = _erlang2['default'].atom("Atom");

Atom.to_string = function (atom) {
  return Symbol.keyFor(atom);
};

Atom.to_char_list = function (atom) {
  return Atom.to_string(atom).split('');
};

exports['default'] = Atom;
module.exports = exports['default'];
});

require.register("__lib/bit_string", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function value(target, firstSource) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

if (!String.prototype.codePointAt) {
  (function () {
    var codePointAt = function codePointAt(position) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      var size = string.length;
      // `ToInteger`
      var index = position ? Number(position) : 0;
      if (index !== index) {
        // better `isNaN`
        index = 0;
      }
      // Account for out-of-bounds indices:
      if (index < 0 || index >= size) {
        return undefined;
      }
      // Get the first code unit
      var first = string.charCodeAt(index);
      var second;
      if ( // check if it’s the start of a surrogate pair
      first >= 0xD800 && first <= 0xDBFF && // high surrogate
      size > index + 1 // there is a next code unit
      ) {
          second = string.charCodeAt(index + 1);
          if (second >= 0xDC00 && second <= 0xDFFF) {
            // low surrogate
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
          }
        }
      return first;
    };
    if (Object.defineProperty) {
      Object.defineProperty(String.prototype, 'codePointAt', {
        'value': codePointAt,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.codePointAt = codePointAt;
    }
  })();
}

var BitString = {};

BitString.__MODULE__ = Symbol['for']("BitString");

BitString.integer = function (value) {
  return BitString.wrap(value, { 'type': 'integer', 'unit': 1, 'size': 8 });
};

BitString.float = function (value) {
  return BitString.wrap(value, { 'type': 'float', 'unit': 1, 'size': 64 });
};

BitString.bitstring = function (value) {
  return BitString.wrap(value, { 'type': 'bitstring', 'unit': 1, 'size': value.length });
};

BitString.bits = function (value) {
  return BitString.bitstring(value);
};

BitString.binary = function (value) {
  return BitString.wrap(value, { 'type': 'binary', 'unit': 8, 'size': value.length });
};

BitString.bytes = function (value) {
  return BitString.binary(value);
};

BitString.utf8 = function (value) {
  return BitString.wrap(value, { 'type': 'utf8' });
};

BitString.utf16 = function (value) {
  return BitString.wrap(value, { 'type': 'utf16' });
};

BitString.utf32 = function (value) {
  return BitString.wrap(value, { 'type': 'utf32' });
};

BitString.signed = function (value) {
  return BitString.wrap(value, {}, 'signed');
};

BitString.unsigned = function (value) {
  return BitString.wrap(value, {}, 'unsigned');
};

BitString.native = function (value) {
  return BitString.wrap(value, {}, 'native');
};

BitString.big = function (value) {
  return BitString.wrap(value, {}, 'big');
};

BitString.little = function (value) {
  return BitString.wrap(value, {}, 'little');
};

BitString.size = function (value, count) {
  return BitString.wrap(value, { 'size': count });
};

BitString.unit = function (value, count) {
  return BitString.wrap(value, { 'unit': count });
};

BitString.wrap = function (value, opt) {
  var new_attribute = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var the_value = value;

  if (!(value instanceof Object)) {
    the_value = { 'value': value, 'attributes': [] };
  }

  the_value = Object.assign(the_value, opt);

  if (new_attribute) {
    the_value.attributes.push(new_attribute);
  }

  return the_value;
};

BitString.toUTF8Array = function (str) {
  var utf8 = [];
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 0x80) {
      utf8.push(charcode);
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | charcode >> 6, 0x80 | charcode & 0x3f);
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | charcode >> 12, 0x80 | charcode >> 6 & 0x3f, 0x80 | charcode & 0x3f);
    }
    // surrogate pair
    else {
        i++;
        // UTF-16 encodes 0x10000-0x10FFFF by
        // subtracting 0x10000 and splitting the
        // 20 bits of 0x0-0xFFFFF into two halves
        charcode = 0x10000 + ((charcode & 0x3ff) << 10 | str.charCodeAt(i) & 0x3ff);
        utf8.push(0xf0 | charcode >> 18, 0x80 | charcode >> 12 & 0x3f, 0x80 | charcode >> 6 & 0x3f, 0x80 | charcode & 0x3f);
      }
  }
  return utf8;
};

BitString.toUTF16Array = function (str) {
  var utf16 = [];
  for (var i = 0; i < str.length; i++) {
    var codePoint = str.codePointAt(i);

    if (codePoint <= 255) {
      utf16.push(0);
      utf16.push(codePoint);
    } else {
      utf16.push(codePoint >> 8 & 0xFF);
      utf16.push(codePoint & 0xFF);
    }
  }
  return utf16;
};

BitString.toUTF32Array = function (str) {
  var utf32 = [];
  for (var i = 0; i < str.length; i++) {
    var codePoint = str.codePointAt(i);

    if (codePoint <= 255) {
      utf32.push(0);
      utf32.push(0);
      utf32.push(0);
      utf32.push(codePoint);
    } else {
      utf32.push(0);
      utf32.push(0);
      utf32.push(codePoint >> 8 & 0xFF);
      utf32.push(codePoint & 0xFF);
    }
  }
  return utf32;
};

//http://stackoverflow.com/questions/2003493/javascript-float-from-to-bits
BitString.float32ToBytes = function (f) {
  var bytes = [];

  var buf = new ArrayBuffer(4);
  new Float32Array(buf)[0] = f;

  var intVersion = new Uint32Array(buf)[0];

  bytes.push(intVersion >> 24 & 0xFF);
  bytes.push(intVersion >> 16 & 0xFF);
  bytes.push(intVersion >> 8 & 0xFF);
  bytes.push(intVersion & 0xFF);

  return bytes;
};

BitString.float64ToBytes = function (f) {
  var bytes = [];

  var buf = new ArrayBuffer(8);
  new Float64Array(buf)[0] = f;

  var intVersion1 = new Uint32Array(buf)[0];
  var intVersion2 = new Uint32Array(buf)[1];

  bytes.push(intVersion2 >> 24 & 0xFF);
  bytes.push(intVersion2 >> 16 & 0xFF);
  bytes.push(intVersion2 >> 8 & 0xFF);
  bytes.push(intVersion2 & 0xFF);

  bytes.push(intVersion1 >> 24 & 0xFF);
  bytes.push(intVersion1 >> 16 & 0xFF);
  bytes.push(intVersion1 >> 8 & 0xFF);
  bytes.push(intVersion1 & 0xFF);

  return bytes;
};

exports['default'] = BitString;
module.exports = exports['default'];
});

require.register("__lib/enum", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var _kernel = require('./kernel');

var _kernel2 = _interopRequireDefault(_kernel);

var Enum = {
  __MODULE__: _erlang2['default'].atom('Enum'),

  all__qmark__: function all__qmark__(collection) {
    var fun = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
      return x;
    } : arguments[1];

    var result = Enum.filter(collection, function (x) {
      return !fun(x);
    });

    return result === [];
  },

  any__qmark__: function any__qmark__(collection) {
    var fun = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
      return x;
    } : arguments[1];

    var result = Enum.filter(collection, function (x) {
      return fun(x);
    });

    return result !== [];
  },

  at: function at(collection, n) {
    var the_default = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    for (var i = 0; i < collection.length; i++) {
      if (i === n) {
        return collection[i];
      }
    }

    return the_default;
  },

  count: function count(collection) {
    var fun = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (fun == null) {
      return _kernel2['default'].length(collection);
    } else {
      return _kernel2['default'].length(collection.filter(fun));
    }
  },

  each: function each(collection, fun) {
    [].forEach.call(collection, fun);
  },

  empty__qmark__: function empty__qmark__(collection) {
    return _kernel2['default'].length(collection) === 0;
  },

  fetch: function fetch(collection, n) {
    if (_kernel2['default'].is_list(collection)) {
      if (n < collection.length && n >= 0) {
        return _erlang2['default'].tuple(_erlang2['default'].atom("ok"), collection[n]);
      } else {
        return _erlang2['default'].atom("error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  fetch__emark__: function fetch__emark__(collection, n) {
    if (_kernel2['default'].is_list(collection)) {
      if (n < collection.length && n >= 0) {
        return collection[n];
      } else {
        throw new Error("out of bounds error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  filter: function filter(collection, fun) {
    return [].filter.call(collection, fun);
  },

  map: function map(collection, fun) {
    return [].map.call(collection, fun);
  },

  map_reduce: function map_reduce(collection, acc, fun) {
    var mapped = _erlang2['default'].list();
    var the_acc = acc;

    for (var i = 0; i < collection.length; i++) {
      var tuple = fun(collection[i], the_acc);

      the_acc = _kernel2['default'].elem(tuple, 1);
      mapped = _erlang2['default'].list.apply(_erlang2['default'], _toConsumableArray(mapped.concat([_kernel2['default'].elem(tuple, 0)])));
    }

    return _erlang2['default'].tuple(mapped, the_acc);
  },

  member: function member(collection, value) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = collection[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var x = _step.value;

        if (x === value) {
          return true;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return false;
  },

  reduce: function reduce(collection, acc, fun) {
    var the_acc = acc;

    for (var i = 0; i < collection.length; i++) {
      the_acc = fun(collection[i], the_acc);
    }

    return the_acc;
  }
};

exports['default'] = Enum;
module.exports = exports['default'];
});

require.register("__lib/erlang", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _bind = Function.prototype.bind;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _bit_string = require('./bit_string');

var _bit_string2 = _interopRequireDefault(_bit_string);

//self.mailbox = self.mailbox || {};

function atom(_value) {
  return Symbol["for"](_value);
}

function list() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return Object.freeze(args);
}

function tuple() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return Object.freeze({ __tuple__: Object.freeze(args) });
}

function bitstring() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  if (!(this instanceof bitstring)) {
    return new (_bind.apply(bitstring, [null].concat(args)))();
  }

  this.raw_value = function () {
    return Object.freeze(args);
  };

  var _value = Object.freeze(this.process(args));

  this.value = function () {
    return _value;
  };

  this.length = _value.length;

  this.get = function (i) {
    return _value[i];
  };

  return this;
}

bitstring.prototype[Symbol.iterator] = function () {
  return this.value()[Symbol.iterator]();
};

bitstring.prototype.toString = function () {
  var i,
      s = "";
  for (i = 0; i < this.length; i++) {
    if (s !== "") {
      s += ", ";
    }
    s += this.get(i).toString();
  }

  return "<<" + s + ">>";
};

bitstring.prototype.process = function () {
  var processed_values = [];

  var i;
  for (i = 0; i < this.raw_value().length; i++) {
    var processed_value = this['process_' + this.raw_value()[i].type](this.raw_value()[i]);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.raw_value()[i].attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var attr = _step.value;

        processed_value = this['process_' + attr](processed_value);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    processed_values = processed_values.concat(processed_value);
  }

  return processed_values;
};

bitstring.prototype.process_integer = function (value) {
  return value.value;
};

bitstring.prototype.process_float = function (value) {
  if (value.size === 64) {
    return _bit_string2["default"].float64ToBytes(value.value);
  } else if (value.size === 32) {
    return _bit_string2["default"].float32ToBytes(value.value);
  }

  throw new Error('Invalid size for float');
};

bitstring.prototype.process_bitstring = function (value) {
  return value.value.value;
};

bitstring.prototype.process_binary = function (value) {
  return _bit_string2["default"].toUTF8Array(value.value);
};

bitstring.prototype.process_utf8 = function (value) {
  return _bit_string2["default"].toUTF8Array(value.value);
};

bitstring.prototype.process_utf16 = function (value) {
  return _bit_string2["default"].toUTF16Array(value.value);
};

bitstring.prototype.process_utf32 = function (value) {
  return _bit_string2["default"].toUTF32Array(value.value);
};

bitstring.prototype.process_signed = function (value) {
  return new Uint8Array([value])[0];
};

bitstring.prototype.process_unsigned = function (value) {
  return value;
};

bitstring.prototype.process_native = function (value) {
  return value;
};

bitstring.prototype.process_big = function (value) {
  return value;
};

bitstring.prototype.process_little = function (value) {
  return value.reverse();
};

bitstring.prototype.process_size = function (value) {
  return value;
};

bitstring.prototype.process_unit = function (value) {
  return value;
};

var Erlang = {
  atom: atom,
  tuple: tuple,
  list: list,
  bitstring: bitstring
};

exports["default"] = Erlang;
module.exports = exports["default"];
});

require.register("__lib/funcy/fun", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _match = require('./match');

var _match2 = _interopRequireDefault(_match);

var _match_error = require('./match_error');

var _match_error2 = _interopRequireDefault(_match_error);

/**
 * @preserve jFun - JavaScript Pattern Matching v0.12
 *
 * Licensed under the new BSD License.
 * Copyright 2008, Bram Stein
 * All rights reserved.
 */
var fun = function fun() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var patterns = args.slice(0).map(function (value, i) {
    var pattern = {
      pattern: _match2['default'].buildMatch(value[0]),
      fn: value[1],
      guard: value.length === 3 ? value[2] : function () {
        return true;
      }
    };

    return pattern;
  });

  return function () {
    for (var _len2 = arguments.length, inner_args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      inner_args[_key2] = arguments[_key2];
    }

    var value = inner_args.slice(0),
        result = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = patterns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var pattern = _step.value;

        if (pattern.pattern(value, result) && pattern.guard.apply(this, result)) {
          return pattern.fn.apply(this, result);
        }

        result = [];
      }
      // no matches were made so we throw an exception.
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    throw new _match_error2['default']('No match for: ' + value);
  };
};

fun.bind = function (pattern, expr) {
  var result = [];
  var processedPattern = _match2['default'].buildMatch(pattern);
  if (processedPattern(expr, result)) {
    return result;
  } else {
    throw new _match_error2['default']('No match for: ' + expr);
  }
};

fun.parameter = function (name, orElse) {
  function Parameter(n, o) {
    this.name = n;
    this.orElse = o;
  }
  return new Parameter(name, orElse);
};

fun.capture = function (pattern) {
  function Capture(p) {
    this.pattern = p;
  }
  return new Capture(pattern);
};

fun.startsWith = function (substr) {
  function StartsWith(s) {
    this.substr = s;
  }

  return new StartsWith(substr);
};

fun.wildcard = (function () {
  function Wildcard() {}
  return new Wildcard();
})();

fun.headTail = (function () {
  function HeadTail() {}
  return new HeadTail();
})();

fun.bound = function (value) {
  function Bound(v) {
    this.value = v;
  }

  return new Bound(value);
};

exports['default'] = fun;
module.exports = exports['default'];
});

require.register("__lib/funcy/match", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _object = require('./object');

var _object2 = _interopRequireDefault(_object);

function buildMatch(pattern) {
  // A parameter can either be a function, or the result of invoking that
  // function so we need to check for both.
  if (_type2['default'].isUndefined(pattern) || _type2['default'].isWildcard(pattern)) {
    return matchWildcard(pattern);
  } else if (_type2['default'].isBound(pattern)) {
    return matchBound(pattern);
  } else if (_type2['default'].isParameter(pattern)) {
    return matchParameter(pattern);
  } else if (_type2['default'].isHeadTail(pattern)) {
    return matchHeadTail(pattern);
  } else if (_type2['default'].isStartsWith(pattern)) {
    return matchStartsWith(pattern);
  } else if (_type2['default'].isCapture(pattern)) {
    return matchCapture(pattern);
  } else if (_type2['default'].isAtom(pattern)) {
    return matchAtom(pattern);
  } else if (_type2['default'].isRegExp(pattern)) {
    return matchRegExp(pattern);
  } else if (_type2['default'].isObject(pattern)) {
    return matchObject(pattern);
  } else if (_type2['default'].isArray(pattern)) {
    return matchArray(pattern);
  } else if (_type2['default'].isFunction(pattern)) {
    return matchFunction(pattern);
  } else if (_type2['default'].isSymbol(pattern)) {
    return matchSymbol(pattern);
  }
}

function equals(one, two) {
  if (typeof one !== typeof two) {
    return false;
  }

  if (_type2['default'].isArray(one) || _type2['default'].isObject(one) || _type2['default'].isString(one)) {
    if (one.length !== two.length) {
      return false;
    }

    for (var i in one) {
      if (!equals(one[i], two[i])) {
        return false;
      }
    }

    return true;
  }

  return one === two;
}

function matchBound(pattern) {
  return function (value, bindings) {
    return equals(value, pattern.value) && bindings.push(value) > 0;
  };
}

function matchParameter(pattern) {
  return function (value, bindings) {
    return bindings.push(value) > 0;
  };
}

function matchWildcard(pattern) {
  return function () {
    return true;
  };
}

function matchHeadTail(patternHeadTail) {
  return function (value, bindings) {
    return value.length > 1 && bindings.push(value[0]) > 0 && bindings.push(value.slice(1)) > 0;
  };
}

function matchCapture(patternCapture) {
  var pattern = patternCapture.pattern;
  var subMatches = buildMatch(pattern);

  return function (value, bindings) {
    return subMatches(value, bindings) && bindings.push(value) > 0;
  };
}

function matchStartsWith(patternStartsWith) {
  var substr = patternStartsWith.substr;

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  return function (value, bindings) {
    return _type2['default'].isString(substr) && value.startsWith(substr) && value.substring(substr.length) !== '' && bindings.push(value.substring(substr.length)) > 0;
  };
}

function matchSymbol(patternSymbol) {
  var type = typeof patternSymbol,
      value = patternSymbol;

  return function (valueSymbol, bindings) {
    return typeof valueSymbol === type && valueSymbol === value;
  };
}

function matchAtom(patternAtom) {
  var type = typeof patternAtom,
      value = patternAtom;

  return function (valueAtom, bindings) {
    return typeof valueAtom === type && valueAtom === value || typeof value === 'number' && isNaN(valueAtom) && isNaN(value);
  };
}

function matchRegExp(patternRegExp) {
  return function (value, bindings) {
    return !(typeof value === undefined) && typeof value === 'string' && patternRegExp.test(value);
  };
}

function matchFunction(patternFunction) {
  return function (value, bindings) {
    return value.constructor === patternFunction && bindings.push(value) > 0;
  };
}

function matchArray(patternArray) {
  var patternLength = patternArray.length,
      subMatches = patternArray.map(function (value) {
    return buildMatch(value);
  });

  return function (valueArray, bindings) {
    return patternLength === valueArray.length && valueArray.every(function (value, i) {
      return i in subMatches && subMatches[i](valueArray[i], bindings);
    });
  };
}

function matchObject(patternObject) {
  var type = patternObject.constructor,
      patternLength = 0,

  // Figure out the number of properties in the object
  // and the keys we need to check for. We put these
  // in another object so access is very fast. The build_match
  // function creates new subtests which we execute later.
  subMatches = _object2['default'].map(patternObject, function (value) {
    patternLength += 1;
    return buildMatch(value);
  });

  // We then return a function which uses that information
  // to check against the object passed to it.
  return function (valueObject, bindings) {
    if (valueObject.constructor !== type) {
      return false;
    }

    var newValueObject = {};

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(patternObject)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        if (key in valueObject) {
          newValueObject[key] = valueObject[key];
        } else {
          return false;
        }
      }

      // Checking the object type is very fast so we do it first.
      // Then we iterate through the value object and check the keys
      // it contains against the hash object we built earlier.
      // We also count the number of keys in the value object,
      // so we can also test against it as a final check.
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return _object2['default'].every(newValueObject, function (value, key) {
      return key in subMatches && subMatches[key](newValueObject[key], bindings);
    });
  };
}

exports['default'] = {
  buildMatch: buildMatch
};
module.exports = exports['default'];
});

require.register("__lib/funcy/match_error", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function MatchError(message) {
  this.name = 'MatchError';
  this.message = message || 'No match for arguments given';
  this.stack = new Error().stack;
}

MatchError.prototype = Object.create(Error.prototype);
MatchError.prototype.constructor = MatchError;

exports['default'] = MatchError;
module.exports = exports['default'];
});

require.register("__lib/funcy/object", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var object = {
  extend: function extend(obj) {
    var i = 1,
        key = undefined,
        len = arguments.length;
    for (; i < len; i += 1) {
      for (key in arguments[i]) {
        // make sure we do not override built-in methods but toString and valueOf
        if (arguments[i].hasOwnProperty(key) && (!obj[key] || obj.propertyIsEnumerable(key) || key === 'toString' || key === 'valueOf')) {
          obj[key] = arguments[i][key];
        }
      }
    }
    return obj;
  },

  filter: function filter(obj, fun, thisObj) {
    var key = undefined,
        r = {},
        val = undefined;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        val = obj[key];
        if (fun.call(thisObj, val, key, obj)) {
          r[key] = val;
        }
      }
    }
    return r;
  },

  map: function map(obj, fun, thisObj) {
    var key = undefined,
        r = {};
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        r[key] = fun.call(thisObj, obj[key], key, obj);
      }
    }
    return r;
  },

  forEach: function forEach(obj, fun, thisObj) {
    var key = undefined;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        fun.call(thisObj, obj[key], key, obj);
      }
    }
  },

  every: function every(obj, fun, thisObj) {
    var key = undefined;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && !fun.call(thisObj, obj[key], key, obj)) {
        return false;
      }
    }
    return true;
  },

  some: function some(obj, fun, thisObj) {
    var key = undefined;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && fun.call(thisObj, obj[key], key, obj)) {
        return true;
      }
    }
    return false;
  },

  isEmpty: function isEmpty(obj) {
    return object.every(obj, function (value, key) {
      return !obj.hasOwnProperty(key);
    });
  },

  values: function values(obj) {
    var r = [];
    object.forEach(obj, function (value) {
      r.push(value);
    });
    return r;
  },

  keys: function keys(obj) {
    var r = [];
    object.forEach(obj, function (value, key) {
      r.push(key);
    });
    return r;
  },

  reduce: function reduce(obj, fun, initial) {
    var key = undefined,
        initialKey = undefined;

    if (object.isEmpty(obj) && initial === undefined) {
      throw new TypeError();
    }
    if (initial === undefined) {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          initial = obj[key];
          initialKey = key;
          break;
        }
      }
    }
    for (key in obj) {
      if (obj.hasOwnProperty(key) && key !== initialKey) {
        initial = fun.call(null, initial, obj[key], key, obj);
      }
    }
    return initial;
  }
};

exports['default'] = object;
module.exports = exports['default'];
});

require.register("__lib/funcy/type", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fun = require('./fun');

var _fun2 = _interopRequireDefault(_fun);

var Type = {
  isSymbol: function isSymbol(value) {
    return typeof x === 'symbol';
  },

  isAtom: function isAtom(value) {
    return !Type.isSymbol(value) && ((typeof value !== 'object' || value === null) && typeof value !== 'function') || Type.isBoolean(value) || Type.isNumber(value) || Type.isString(value);
  },

  isRegExp: function isRegExp(value) {
    return value.constructor.name === "RegExp" || value instanceof RegExp;
  },

  isNumber: function isNumber(value) {
    return (typeof value === 'number' || value instanceof Number) && !isNaN(value);
  },

  isString: function isString(value) {
    return typeof value === 'string' || value instanceof String;
  },

  isBoolean: function isBoolean(value) {
    return value !== null && (typeof value === 'boolean' || value instanceof Boolean);
  },

  isArray: function isArray(value) {
    return Array.isArray(value);
  },

  isObject: function isObject(value) {
    return Object.prototype.toString.apply(value) === '[object Object]';
  },

  isFunction: function isFunction(value) {
    return typeof value === 'function';
  },

  isDefined: function isDefined(value) {
    return typeof value !== 'undefined';
  },

  isUndefined: function isUndefined(value) {
    return typeof value === 'undefined';
  },

  isWildcard: function isWildcard(value) {
    return value && value.constructor === _fun2['default'].wildcard.constructor;
  },

  isVariable: function isVariable(value) {
    return value && typeof value === 'object' && typeof value.is_variable === 'function' && typeof value.get_name === 'function' && value.is_variable();
  },

  isParameter: function isParameter(value) {
    return value && (value === _fun2['default'].parameter || value.constructor.name === _fun2['default'].parameter().constructor.name);
  },

  isStartsWith: function isStartsWith(value) {
    return value && value.constructor.name === _fun2['default'].startsWith().constructor.name;
  },

  isCapture: function isCapture(value) {
    return value && value.constructor.name === _fun2['default'].capture().constructor.name;
  },

  isHeadTail: function isHeadTail(value) {
    return value.constructor === _fun2['default'].headTail.constructor;
  },

  isBound: function isBound(value) {
    return value && value.constructor.name === _fun2['default'].bound().constructor.name;
  }
};

exports['default'] = Type;
module.exports = exports['default'];
});

require.register("__lib/integer", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var Integer = {
  __MODULE__: _erlang2['default'].atom('Integer'),

  is_even: function is_even(n) {
    return n % 2 === 0;
  },

  is_odd: function is_odd(n) {
    return n % 2 !== 0;
  },

  parse: function parse(bin) {
    var result = parseInt(bin);

    if (isNaN(result)) {
      return _erlang2['default'].atom("error");
    }

    var indexOfDot = bin.indexOf(".");

    if (indexOfDot >= 0) {
      return _erlang2['default'].tuple(result, bin.substring(indexOfDot));
    }

    return _erlang2['default'].tuple(result, "");
  },

  to_char_list: function to_char_list(number) {
    var base = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

    return number.toString(base).split('');
  },

  to_string: function to_string(number) {
    var base = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

    return number.toString(base);
  }
};

exports['default'] = Integer;
module.exports = exports['default'];
});

require.register("__lib/kernel", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var _kernelSpecial_forms = require('./kernel/special_forms');

var _kernelSpecial_forms2 = _interopRequireDefault(_kernelSpecial_forms);

var _kernelJs = require('./kernel/js');

var _kernelJs2 = _interopRequireDefault(_kernelJs);

var _funcyFun = require('./funcy/fun');

var _funcyFun2 = _interopRequireDefault(_funcyFun);

var _tuple = require('./tuple');

var _tuple2 = _interopRequireDefault(_tuple);

var Kernel = {
  __MODULE__: _erlang2['default'].atom('Kernel'),

  SpecialForms: _kernelSpecial_forms2['default'],
  JS: _kernelJs2['default'],

  tl: function tl(list) {
    return _erlang2['default'].list.apply(_erlang2['default'], _toConsumableArray(list.slice(1)));
  },

  hd: function hd(list) {
    return list[0];
  },

  is_nil: function is_nil(x) {
    return x == null;
  },

  is_atom: function is_atom(x) {
    return typeof x === 'symbol';
  },

  is_binary: function is_binary(x) {
    return typeof x === 'string' || x instanceof String;
  },

  is_boolean: function is_boolean(x) {
    return typeof x === 'boolean' || x instanceof Boolean;
  },

  is_function: function is_function(x) {
    var arity = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

    return typeof x === 'function' || x instanceof Function;
  },

  // from: http://stackoverflow.com/a/3885844
  is_float: function is_float(x) {
    return x === +x && x !== (x | 0);
  },

  is_integer: function is_integer(x) {
    return x === +x && x === (x | 0);
  },

  is_list: function is_list(x) {
    return x instanceof Array;
  },

  is_map: function is_map(x) {
    return typeof x === 'object' || x instanceof Object && x.__tuple__ === null;
  },

  is_number: function is_number(x) {
    return Kernel.is_integer(x) || Kernel.is_float(x);
  },

  is_tuple: function is_tuple(x) {
    return (typeof x === 'object' || x instanceof Object) && x.__tuple__ !== null;
  },

  length: function length(x) {
    return x.length;
  },

  is_pid: function is_pid(x) {
    return false;
  },

  is_port: function is_port(x) {},

  is_reference: function is_reference(x) {},

  is_bitstring: function is_bitstring(x) {
    return Kernel.is_binary(x) || x instanceof _erlang2['default'].bitstring;
  },

  __in__: function __in__(left, right) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = right[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var x = _step.value;

        if (Kernel.match__qmark__(left, x)) {
          return true;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return false;
  },

  abs: function abs(number) {
    return Math.abs(number);
  },

  round: function round(number) {
    return Math.round(number);
  },

  elem: function elem(tuple, index) {
    if (Kernel.is_list(tuple)) {
      return tuple[index];
    }

    return tuple.__tuple__[index];
  },

  rem: function rem(left, right) {
    return left % right;
  },

  div: function div(left, right) {
    return left / right;
  },

  and: function and(left, right) {
    return left && right;
  },

  or: function or(left, right) {
    return left || right;
  },

  not: function not(arg) {
    return !arg;
  },

  apply: function apply(module, func, args) {
    if (arguments.length === 3) {
      return module[func].apply(null, args);
    } else {
      return module.apply(null, func);
    }
  },

  to_string: function to_string(arg) {
    if (Kernel.is_tuple(arg)) {
      return _tuple2['default'].to_string(arg);
    }

    return arg.toString();
  },

  'throw': function _throw(e) {
    throw e;
  },

  match__qmark__: function match__qmark__(pattern, expr) {
    var guard = arguments.length <= 2 || arguments[2] === undefined ? function () {
      return true;
    } : arguments[2];

    try {
      var match = (0, _funcyFun2['default'])([[pattern], function () {
        return true;
      }, guard]);

      return match(expr);
    } catch (e) {
      return false;
    }
  }
};

exports['default'] = Kernel;
module.exports = exports['default'];
});

require.register("__lib/kernel/js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _erlang = require('../erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var JS = {
  __MODULE__: _erlang2['default'].atom('JS'),

  get_property_or_call_function: function get_property_or_call_function(item, property) {
    if (item[property] instanceof Function) {
      return item[property]();
    } else {
      return item[property];
    }
  },

  create_namespace: function create_namespace(module_name_list, root) {
    var parent = root;

    var tail = _erlang2['default'].list.apply(_erlang2['default'], _toConsumableArray(module_name_list.slice(1)));

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = tail[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var atom = _step.value;

        var partname = Symbol.keyFor(atom);

        if (typeof parent[partname] === "undefined") {
          parent[partname] = {};
        }

        parent = parent[partname];
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return parent;
  }
};

exports['default'] = JS;
module.exports = exports['default'];
});

require.register("__lib/kernel/special_forms", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _erlang = require('../erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var _funcyFun = require('../funcy/fun');

var _funcyFun2 = _interopRequireDefault(_funcyFun);

var SpecialForms = {
  __MODULE__: _erlang2['default'].atom('SpecialForms'),

  'case': function _case(condition, clauses) {
    return (0, _funcyFun2['default'])(clauses).call(condition);
  },

  fn: function fn(clauses) {
    return (0, _funcyFun2['default'])(clauses);
  },

  cond: function cond(clauses) {
    for (var clause in clauses) {
      if (clause[0]) {
        return clause[1]();
      }
    }
  },

  'import': function _import(module, opts) {
    var imported_module = SpecialForms.alias(module);

    if (opts.length === 0) {
      return imported_module;
    } else if (opts[_erlang2['default'].atom("only")]) {
      var exported = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = opts[_erlang2['default'].atom("only")][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          var key = Symbol.keyFor(item.get(0));
          exported[key] = imported_module[key];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return exported;
    } else if (opts[_erlang2['default'].atom("except")]) {
      var exported = {};
      var except_list = opts[_erlang2['default'].atom("except")];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = imported_module[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = _slicedToArray(_step2.value, 2);

          var key = _step2$value[0];
          var value = _step2$value[1];

          for (var i = 0; i < except_list.length; i++) {
            if (except_list[i] === _erlang2['default'].atom(key)) {
              exported[key] = imported_module[key];
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return exported;
    }
  },

  alias: function alias(module, opts) {
    return System['import'](module).resolve();
  },

  require: function require(module, opts) {
    if (module === undefined) {
      throw new Error("module is not loaded and could not be found");
    }

    SpecialForms.alias(module, opts);
  },

  receive: function receive(receive_fun) {
    var timeout_in_ms = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var timeout_fn = arguments.length <= 2 || arguments[2] === undefined ? function (time) {
      return true;
    } : arguments[2];

    if (timeout_in_ms == null || timeout_in_ms === System['for']('infinity')) {
      while (true) {
        if (self.mailbox.length !== 0) {
          var message = self.mailbox[0];
          self.mailbox = self.mailbox.slice(1);
          return receive_fun(message);
        }
      }
    } else if (timeout_in_ms === 0) {
      if (self.mailbox.length !== 0) {
        var message = self.mailbox[0];
        self.mailbox = self.mailbox.slice(1);
        return receive_fun(message);
      } else {
        return null;
      }
    } else {
      var now = Date.now();
      while (Date.now() < now + timeout_in_ms) {
        if (self.mailbox.length !== 0) {
          var message = self.mailbox[0];
          self.mailbox = self.mailbox.slice(1);
          return receive_fun(message);
        }
      }

      return timeout_fn(timeout_in_ms);
    }
  }
};

exports['default'] = SpecialForms;
module.exports = exports['default'];
});

require.register("__lib/list", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var _kernel = require('./kernel');

var _kernel2 = _interopRequireDefault(_kernel);

var List = {};

List.__MODULE__ = _erlang2['default'].atom('List');

List['delete'] = function (list, item) {
  var new_value = [];
  var value_found = false;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var x = _step.value;

      if (x === item && value_found !== false) {
        new_value.push(x);
        value_found = true;
      } else if (x !== item) {
        new_value.push(x);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_value);
};

List.delete_at = function (list, index) {
  var new_value = [];

  for (var i = 0; i < list.length; i++) {
    if (i !== index) {
      new_value.push(list[i]);
    }
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_value);
};

List.duplicate = function (elem, n) {
  var new_value = [];

  for (var i = 0; i < n; i++) {
    new_value.push(elem);
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_value);
};

List.first = function (list) {
  if (list.length === 0) {
    return null;
  }

  return list[0];
};

List.flatten = function (list) {
  var tail = arguments.length <= 1 || arguments[1] === undefined ? _erlang2['default'].list() : arguments[1];

  var new_value = [];

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = list[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var x = _step2.value;

      if (_kernel2['default'].is_list(x)) {
        new_value = new_value.concat(List.flatten(x));
      } else {
        new_value.push(x);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  new_value = new_value.concat(tail);

  return _erlang2['default'].list.apply(_erlang2['default'], _toConsumableArray(new_value));
};

List.foldl = function (list, acc, func) {
  var new_acc = acc;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = list[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var x = _step3.value;

      new_acc = func(x, new_acc);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3['return']) {
        _iterator3['return']();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return new_acc;
};

List.foldr = function (list, acc, func) {
  var new_acc = acc;

  for (var i = list.length - 1; i >= 0; i--) {
    new_acc = func(list[i], new_acc);
  }

  return new_acc;
};

List.insert_at = function (list, index, value) {
  var new_value = [];

  for (var i = 0; i < list.length; i++) {
    if (i === index) {
      new_value.push(value);
      new_value.push(list[i]);
    } else {
      new_value.push(list[i]);
    }
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_value);
};

List.keydelete = function (list, key, position) {
  var new_list = [];

  for (var i = 0; i < list.length; i++) {
    if (!_kernel2['default'].match__qmark__(list[i][position], key)) {
      new_list.push(list[i]);
    }
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_list);
};

List.keyfind = function (list, key, position) {
  var _default = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

  for (var i = 0; i < list.length; i++) {
    if (_kernel2['default'].match__qmark__(list[i][position], key)) {
      return list[i];
    }
  }

  return _default;
};

List.keymember__qmark__ = function (list, key, position) {

  for (var i = 0; i < list.length; i++) {
    if (_kernel2['default'].match__qmark__(list[i][position], key)) {
      return true;
    }
  }

  return false;
};

List.keyreplace = function (list, key, position, new_tuple) {
  var new_list = [];

  for (var i = 0; i < list.length; i++) {
    if (!_kernel2['default'].match__qmark__(list[i][position], key)) {
      new_list.push(list[i]);
    } else {
      new_list.push(new_tuple);
    }
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_list);
};

List.keysort = function (list, position) {
  var new_list = list;

  new_list.sort(function (a, b) {
    if (position === 0) {
      if (a[position].value < b[position].value) {
        return -1;
      }

      if (a[position].value > b[position].value) {
        return 1;
      }

      return 0;
    } else {
      if (a[position] < b[position]) {
        return -1;
      }

      if (a[position] > b[position]) {
        return 1;
      }

      return 0;
    }
  });

  return _erlang2['default'].list.apply(_erlang2['default'], _toConsumableArray(new_list));
};

List.keystore = function (list, key, position, new_tuple) {
  var new_list = [];
  var replaced = false;

  for (var i = 0; i < list.length; i++) {
    if (!_kernel2['default'].match__qmark__(list[i][position], key)) {
      new_list.push(list[i]);
    } else {
      new_list.push(new_tuple);
      replaced = true;
    }
  }

  if (!replaced) {
    new_list.push(new_tuple);
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_list);
};

List.last = function (list) {
  if (list.length === 0) {
    return null;
  }

  return list[list.length - 1];
};

List.replace_at = function (list, index, value) {
  var new_value = [];

  for (var i = 0; i < list.length; i++) {
    if (i === index) {
      new_value.push(value);
    } else {
      new_value.push(list[i]);
    }
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_value);
};

List.update_at = function (list, index, fun) {
  var new_value = [];

  for (var i = 0; i < list.length; i++) {
    if (i === index) {
      new_value.push(fun(list[i]));
    } else {
      new_value.push(list[i]);
    }
  }

  return new_value;
};

List.wrap = function (list) {
  if (_kernel2['default'].is_list(list)) {
    return list;
  } else if (list == null) {
    return _erlang2['default'].list();
  } else {
    return _erlang2['default'].list(list);
  }
};

List.zip = function (list_of_lists) {
  if (list_of_lists.length === 0) {
    return _erlang2['default'].list();
  }

  var new_value = [];
  var smallest_length = list_of_lists[0];

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = list_of_lists[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var x = _step4.value;

      if (x.length < smallest_length) {
        smallest_length = x.length;
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4['return']) {
        _iterator4['return']();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  for (var i = 0; i < smallest_length; i++) {
    var current_value = [];
    for (var j = 0; j < list_of_lists.length; j++) {
      current_value.push(list_of_lists[j][i]);
    }

    new_value.push(_erlang2['default'].tuple.apply(_erlang2['default'], current_value));
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_value);
};

List.to_tuple = function (list) {
  return _erlang2['default'].tuple.apply(null, list);
};

List.append = function (list, value) {
  return _erlang2['default'].list.apply(_erlang2['default'], _toConsumableArray(list.concat([value])));
};

List.concat = function (left, right) {
  return _erlang2['default'].list.apply(_erlang2['default'], _toConsumableArray(left.concat(right)));
};

exports['default'] = List;
module.exports = exports['default'];
});

require.register("__lib/logger", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var Logger = {
  __MODULE__: _erlang2['default'].atom('Logger'),

  debug: function debug(message) {
    console.debug(message);
  },

  warn: function warn(message) {
    console.warn(message);
  },

  info: function info(message) {
    console.info(message);
  },

  error: function error(message) {
    console.error(message);
  },

  log: function log(type, message) {
    if (type.value === "warn") {
      console.warn(message);
    } else if (type.value === "debug") {
      console.debug(message);
    } else if (type.value === "info") {
      console.info(message);
    } else if (type.value === "error") {
      console.error(message);
    } else {
      throw new Error("invalid type");
    }
  }
};

exports['default'] = Logger;
module.exports = exports['default'];
});

require.register("__lib/mutable", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var Mutable = {
  __MODULE__: _erlang2['default'].atom('Mutable'),

  update: function update(obj, prop, value) {
    obj[prop] = value;
  }
};

exports['default'] = Mutable;
module.exports = exports['default'];
});

require.register("__lib/range", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var Range = function Range(_first, _last) {
  if (!(this instanceof Range)) {
    return new Range(_first, _last);
  }

  this.first = function () {
    return _first;
  };

  this.last = function () {
    return _last;
  };

  var _range = [];

  for (var i = _first; i <= _last; i++) {
    _range.push(i);
  }

  _range = Object.freeze(_range);

  this.value = function () {
    return _range;
  };

  this.length = function () {
    return _range.length;
  };

  return this;
};

Range.__MODULE__ = _erlang2['default'].atom('Range');

Range.prototype[Symbol.iterator] = function () {
  return this.value()[Symbol.iterator]();
};

Range['new'] = function (first, last) {
  return Range(first, last);
};

Range.range__qmark__ = function (range) {
  return range instanceof Range;
};

exports['default'] = Range;
module.exports = exports['default'];
});

require.register("__lib/tuple", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _erlang = require('./erlang');

var _erlang2 = _interopRequireDefault(_erlang);

var Tuple = {};

Tuple.__MODULE__ = _erlang2['default'].atom('Tuple');

Tuple.to_string = function (tuple) {
  var i,
      s = "";
  for (i = 0; i < tuple.__tuple__.length; i++) {
    if (s !== "") {
      s += ", ";
    }
    s += tuple.__tuple__[i].toString();
  }

  return "{" + s + "}";
};

Tuple.delete_at = function (tuple, index) {
  var new_list = [];

  for (var i = 0; i < tuple.__tuple__.length; i++) {
    if (i !== index) {
      new_list.push(tuple.__tuple__[i]);
    }
  }

  return _erlang2['default'].tuple.apply(null, new_list);
};

Tuple.duplicate = function (data, size) {
  var array = [];

  for (var i = size - 1; i >= 0; i--) {
    array.push(data);
  }

  return _erlang2['default'].tuple.apply(null, array);
};

Tuple.insert_at = function (tuple, index, term) {
  var new_tuple = [];

  for (var i = 0; i <= tuple.__tuple__.length; i++) {
    if (i === index) {
      new_tuple.push(term);
      i++;
      new_tuple.push(tuple.__tuple__[i]);
    } else {
      new_tuple.push(tuple.__tuple__[i]);
    }
  }

  return _erlang2['default'].tuple.apply(null, new_tuple);
};

Tuple.from_list = function (list) {
  return _erlang2['default'].tuple.apply(null, list);
};

Tuple.to_list = function (tuple) {
  var new_list = [];

  for (var i = 0; i < tuple.__tuple__.length; i++) {
    new_list.push(tuple.__tuple__[i]);
  }

  return _erlang2['default'].list.apply(_erlang2['default'], new_list);
};

Tuple.iterator = function (tuple) {
  return tuple.__tuple__[Symbol.iterator]();
};

exports['default'] = Tuple;
module.exports = exports['default'];
});

require.register("calc", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libErlang = require('__lib/erlang');

var _libErlang2 = _interopRequireDefault(_libErlang);

var _libKernel = require('__lib/kernel');

var _libKernel2 = _interopRequireDefault(_libKernel);

var _libTuple = require('__lib/tuple');

var _libTuple2 = _interopRequireDefault(_libTuple);

var _libFuncyFun = require('__lib/funcy/fun');

var _libFuncyFun2 = _interopRequireDefault(_libFuncyFun);

var __MODULE__ = _libErlang2['default'].atom('Calc');
var add = (0, _libFuncyFun2['default'])([[_libFuncyFun2['default'].parameter, _libFuncyFun2['default'].parameter], function (first, second) {
    return first + second;
}]);
exports['default'] = {
    add: add
};
module.exports = exports['default'];
});


//# sourceMappingURL=app.js.map