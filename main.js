(function() {
    var root = this;
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };
 
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }
 
    if (typeof define === 'function' && define.amd) {
        define('underscore', [], function() {
            return _;
        });
    }

    _.VERSION = '0.0.1';

    // 减少在原型链查找的次数
    var push = Array.prototype.push,
    silce = Array.prototype.slice,
    toString = Object.prototype.toString,
    hasOwnProperty = Object.prototype.hasOwnProperty;

    var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = Function.prototype.bind,
    nativeCreate = Object.create;

    var optimizeCb = function(func, context, argCount) {
        if (context === void 0) return func;

        switch (argCount == null ? 3 : argCount) {
            case 1:
                return function(value) {
                    return func.call(context, value);
                };
            case 2:
                return function(value, other) {
                    return func.call(context, value, other);
                };
            case 3:
                return function(value, index, collection) {
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function(accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
        }

        return function() {
            return func.apply(context, arguments);
        };
    };

    var cb = function(value, context, argCount) {
        if (value == null) return _.identity;
        if (_.isFunction(value)) return optimizeCb(value, context, argCount);
        if (_.isObject(value)) return _.matcher(value);
        return _.property(value);
    }

    _.iteratee = function(value, context) {
        return cb(value, context, Infinity)
    }

    var property = function(key) {
        return function(obj) {
            return obj == null ? void 0 : obj[key];
        };
    };

    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

    var getLength = property('length');

    // 返回类数组对象 
    var isArrayLike = function(collection) {
        var length = getLength(collection);
        
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    }

    _.each = function(obj, callback) {
        var length, i = 0;

        if (isArrayLike(obj)) {
            length = obj.length;

            for (; i<length; i++) {
                if (callback.call(obj[i], obj[i], i) === false) {
                    break;
                }
            }
        } else {
            for (i in obj) {
                if (callback.call(obj[i], obj[i], i) === false) {
                    break;
                }
            }
        }

        return obj;
    }

    _.functions = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) {
                names.push(key)
            }
        }
        return names.sort();
    };

    // 判断是否为 DOM 元素
    _.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // 
    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) === '[object Array]';
    };

    // 
    _.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    // 
    _.isNull = function(obj) {
        return obj === null;
    };

    _.isNaN = function(obj) {
        return _.isNumber(obj) && obj !== +obj;
    }

    _.isBoolean = function(obj) {
        return toString.call(obj) === '[object Boolean]';
    };

    _.isUndefined = function(obj) {
        return obj === void 0;
    }

    _.isArguments =  function(obj) {
        return toString.call(obj) === '[object Arguments]'
    }

    _.isFunction =  function(obj) {
        return toString.call(obj) === '[object Function]'
    }

    _.isString =  function(obj) {
        return toString.call(obj) === '[object String]'
    }

    _.isNumber =  function(obj) {
        return toString.call(obj) === '[object Number]'
    }

    _.isDate =  function(obj) {
        return toString.call(obj) === '[object Date]'
    }

    _.isRegExp =  function(obj) {
        return toString.call(obj) === '[object RegExp]'
    }

    _.isError =  function(obj) {
        return toString.call(obj) === '[object Error]'
    }

    // ----------Array------------ //

    // 返回array（数组）的第一个元素。传递 n参数将返回数组中从第一个元素开始的n个元素
    _.first = _.head = _.take = function(array, n) {
        if (array == null) return undefined;
        if (n == null) return array[0];

        return _.initial(array, array.length - n);
    };

    // 返回数组中除了最后一个元素外的其他全部元素。
    // 传递 n参数将从结果中排除从最后一个开始的 n 个元素
    _.initial = function(array, n = 1) {
        var res = [],
        index = 0;

        for (var i = 0; i < array.length - n; i++) {
            res[index++] = array[i];
        }
        return res;
    };

    // 返回数组里的后面的 n 个元素
    _.last = function(array, n) {
        if (array == null) return undefined;
        if (n == null) return array[array.length - 1];

        return _.rest(array, Math.max(0, array.length - n));
    };

    // 返回数组中除了第一个元素外的其他全部元素。传递 n 参数将返回从n开始的剩余所有元素
    _.rest = _.tail = _.drop = function(array, n=1) {
        var index = 0,
        result = [];

        for (var i = n; i < array.length; i++) {
            result[index++] = array[i];
        }

        return result;
    };

    // 返回一个除去所有false值的 array副本。 在javascript中, false, null, 0, "", undefined 和 NaN 都是false值.
    _.compact = function(array) {
        var i = 0;
        const res = [];

        if (array == null) {
            return res;
        }

        for (var value of array) {
            if (value) {
                res[i++] = value;
            }
        }

        return res;
    };

    var flatten = function(input, shallow, strict, startIndex) {
        var output = [],
        idx = 0;

        for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
            var value = input[i];

            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                if (!shallow) {
                    value = flatten(value, shallow, strict);
                }

                var j = 0,
                len = value.length;

                output.length += len;

                while (j < len) {
                    output[idx++] = value[j++];
                }
            } else if (!strict) {
                output[idx++] = value;
            }
        }
        return output;
    };

    // 将一个嵌套多层的数组 array（数组） (嵌套可以是任何层数)转换为只有一层的数组。 
    // 如果你传递 shallow参数，数组将只减少一维的嵌套。
    _.flatten = function(array, shallow) {
        return flatten(array, shallow, false)
    }

    _.without = function(array) {

    }

    // 类似于without，但返回的值来自array参数数组，并且不存在于other 数组
    _.difference = function(array) {
        var rest = flatten(arguments, true, true, 1);

        return
    }

    // 将数组转换为对象。传递任何一个单独[key, value]对的列表，或者一个键的列表和一个值得列表。
    // 如果存在重复键，最后一个值将被返回
    _.object = function(list, value) {
        var result = {};

        for (var i=0, length=getLength(list); i<length; i++) {
            if (value) {
                result[list[i]] = value[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }

        return result;
    };



    // -------Objects--------//

    // 判断对象中是否有指定 key
    _.has = function(obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
    };

    _.property = property;


    //---------Utility---------//

    // 返回与传入参数相等的值. 相当于数学里的: f(x) = x
    _.identity = function(value) {
        return value;
    }

    // 
    _.constant = function(value) {
        return function() {
            return value;
        };
    };

    // 
    _.random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }

        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // 返回undefined，不论传递给它的是什么参数。
    _.noop = function() {}

    // 返回当前时间的 "时间戳"（单位 ms）
    _.now = Date.now || function() {
        return new Date().getTime();
    };


    // ----------mixin
    _.mixin = function(obj) {
        _.each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
                var args = [this._wrapped];

                push.apply(args, arguments);

                return func.apply(_, args);
            };
        });
        return _;
    };

    _.mixin(_);

}.call(this));
