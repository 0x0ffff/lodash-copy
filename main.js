(function() {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global) ||
        this || {};

    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    var previousUnderscore = root._;
 
    if (typeof exports !== 'undefined' && !exports.nodeType) {
        if (typeof module !== 'undefined' && module.exports && !module.nodeType) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }

    _.VERSION = '0.0.1';

    // 减少在原型链查找的次数
    var push = Array.prototype.push,
    slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    hasOwnProperty = Object.prototype.hasOwnProperty;

    var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = Function.prototype.bind,
    nativeCreate = Object.create;

    var optimizeCb = function(func, context) {
        // 如果没有 context，返回 func
        if (context === void 0) return func;

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

    var createAssigner = function(keysFunc, undefinedOnly) {
        return function(obj) {
            var length = arguments.length;
            if (length < 2 || obj == null) {
                return obj;
            }

            for (var index = 1; index < length; index++) {
                var source  = arguments[index],
                keys = keysFunc(source),
                l = keys.length;

                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!undefinedOnly || obj[key] === void 0) {
                        obj[key] = source[key];
                    }
                }
            }
            return obj;
        };
    };

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

    // 遍历list中的所有元素，按顺序用遍历输出每个元素。
    // 如果传递了context参数，则把iteratee绑定到context对象上。
    _.each = _.forEach = function(obj, iteratee, context) {
        // 根据 context 的不同，确定不同的迭代函数
        iteratee = optimizeCb(iteratee, context);

        var i,
        length;

        if (isArrayLike(obj)) {
            // 数组
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            // 对象
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }

        return obj;
    };

    _.functions = _.methods = function(obj) {
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

    // ---------Collections----------- //

    // 如果list中有任何一个元素通过 predicate 的真值检测就返回true。
    // 一旦找到了符合条件的元素, 就直接中断对list的遍历
    // _.some([null, 0, 'yes', false]);
    // ==> true
    _.some = _.any = function(obj, predicate, context) {
        // 根据 context 返回函数
        predicate = cb(predicate, context);

        var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;

        for (var i = 0; i < length; i++) {
            var currentKey = keys ? keys[i] : i;
            // 如果有一个元素满足条件，则返回 true
            if (predicate(obj[currentKey], currentKey, obj)) {
                return true;
            }
        }
        return false;
    };

    // 判断数组中的每个元素或者对象中每个 value 值是否都满足 predicate 函数中的判断条件
    // 如果是，则返回 ture；否则返回 false（有一个不满足就返回 false）
    _.every = _.all = function(obj, predicate, context) {
        predicate = cb(predicate, context);

        var keys = !isArrayLike(obj) && _.keys(obj),
        length = (obj || keys).length;

        for (var i = 0; i < length; i++) {
            var currentKey = keys ? keys[i] : i;
            // 如果有一个元素满足条件，则返回 false
            if (!predicate(obj[currentKey], currentKey, obj)) {
                return false;
            }
        }
        return true;
    };

    function createIndexFinder(dir, predicateFind, sortedIndex) {
        return function(array, item, idx) {
            var i = 0,
            length = getLength(array);

            if (typeof idx == 'number') {
                if (dir > 0) {
                    i = idx >= 0 ? idx : Math.max(idx+length, i);
                } else {
                    length = idx >=0 ? Math.min(idx+1, length) : idx+length+1;
                }
            } else if (sortedIndex && idx && length) {
                idx = sortedIndex(array, item);
                return array[idx] === item ? idx : -1;
            }

            if (item !== item) {
                idx = predicateFind(slice.call(array, i, length), _.isNaN);
                return idx >= 0 ? idx+i : -1;
            }

            for (idx = dir > 0 ? i : length -1; idx >= 0 && idx < length; idx += dir) {
                if (array[idx] === item) {
                    return idx;
                }
            }

            return -1;
        };
    }

    // 遍历数组（每个元素）或者对象的每个元素（value）
    // 对每个元素执行 iteratee 迭代方法
    // 将结果保存到新的数组中，并返回
    _.map = _.collect = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);

        var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        res = Array(length);

        for (var i = 0; i < length; i++) {
            var currentKey = keys ? keys[i] : i;
            res[i] = iteratee(obj[currentKey], currentKey, obj);
        }
        return res;
    };

    // 寻找数组或者对象中所有满足条件的元素
    _.filter = _.select = function(obj, predicate, context) {
        var res = [];

        predicate = cb(predicate, context);

        _.each(obj, function(value, index, list) {
            if (predicate(value, index, list)) {
                res.push(value);
            }
        });

        return res;
    };

    _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
        if (!isArrayLike(obj)) {
            obj = _.values(obj);
        }

        if (typeof fromIndex != 'number' || guard) {
            fromIndex = 0;
        }

        return _.indexOf(obj, item, fromIndex) >= 0;
    };

    // ----------Array------------ //

    // 裁剪数组 array，从 start 位置开始到 end 结束，但不包括 end 本身的位置
    _.slice = function(array, start, end) {
        var length = array.length;
        if (length === 0) {
            return [];
        }

        if (end >= length) {
            end = length;
        }
        var res = [];
        for (var i = start; i < end; i++) {
            res.push(array[i])
        }

        return res;
    }
    
    // 将数组（array）拆分成多个 size 长度的区块，并将这些区块组成一个新数组。
    // 如果 array 无法被分割成全部等长的区块，那么最后剩余的元素将组成一个区块
    _.chunk = function(array, size=1) {
        var res = [];
        for (var i = 0; i < array.length; i+=size) {
            res.push(array.slice(i, i+size));
        }
        return res;
    };

    // 创建一个新数组，将 array 与任何数组或值连接在一起。
    _.concat = function() {
        var length = arguments.length;
        if (!length) {
            return [];
        }

        var res = [];
        for (var i = 0; i < length; i++) {
            if(_.isArray(arguments[i])) {
                res.push(...arguments[i]);
            } else {
                res.push(arguments[i]);
            }
        }
        return res;
    };

    // 使用 value 值来填充（替换） array，从 start 位置开始, 到 end 位置结束（但不包含 end 位置）。
    _.fill = function(array, value, start, end) {
        var length = array ? array.length : 0;
        if (!length) {
            return [];
        }
        if (!start || typeof start != 'number') {
            start = 0;
        }
        if (!end || typeof end != 'number') {
            end = length;
        }

        for (var i = start; i < end; i++) {
            array[i] = value;
        }

        return array;
    }

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

    // 返回一个删除所有values值后的 array副本。
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // 类似于without，但返回的值来自array参数数组，并且不存在于other 数组
    _.difference = function(array) {
        var rest = flatten(arguments, true, true, 1);

        return _.filter(array, function(value) {
            return !_.contains(rest, value);
        });
    };

    // 返回 array去重后的副本
    _.uniq = function(array) {
        return _.filter(array, (item, index, collection) => collection.indexOf(item) === index);
    };

    // 返回传入的 arrays（数组）并集
    _.union = function() {
        return _.uniq(flatten(arguments, true, true));
    };

    // 返回传入 arrays（数组）交集
    _.intersection = function(array) {
        var res = [];

        var argsLength = arguments.length;

        for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];

            if (_.contains(res, item)) continue;

            for (var j = 1; j < argsLength; j++) {
                if (!_.contains(arguments[j], item)) break;
            }
            if (j === argsLength) res.push(item);
        }
        return res;
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

    // 将 每个arrays中相应位置的值合并在一起。
    _.zip = function(...arrays) {
        if (arrays.length === 0 || arrays[0].length === 0) {
            return [];
        }

        // 从一个类似数组或可迭代对象中创建一个新的，浅拷贝的数组实例
        var res = Array.from({length: arrays[0].length}, () => []);
        for (var i = 0; i < arrays.length; i++) {
            for (var j = 0; j < arrays[i].length; j++) {
                res[j][i] = arrays[i][j];
            }
        }

        return res;
    };

    // 返回某一个范围内的数组成的数组
    _.range = function(start, stop, step) {
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }

        step = step || 1;

        // 长度
        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);

        for (var i = 0; i < length; i++, start += step) {
            range[i] = start;
        }

        return range;
    };

    _.indexOf = function(array, value, fromIndex=0) {
        return array.indexOf(value, fromIndex);
    };

    _.lastIndexOf = function(array, value, fromIndex = array.length-1) {
        return array.lastIndexOf(value, fromIndex)
    }

    _.sortedIndex = function(array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);

        var value = iteratee(obj);

        var low = 0,
        high = getLength(array);

        while(low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee(array[mid]) < value) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return low;
    };

    // 将 array 中的所有元素转换为由 separator 分隔的字符串
    _.join = function(array, separator) {
        return array == null ? '' : Array.prototype.join.call(array, separator);
    };

    // 移除数组中 predicate 返回为真值的所有元素，并返回移除元素组成的数组。
    // 会改变传入的 array
    _.remove = function(array, predicate) {
        var res = [];

        // 兼容性
        if (!array && array.length) {
            return res;
        }
        
        var i = -1,
        index = [],
        length = array.length;
        
        while(++i < length) {
            var value = array[i];
            if (predicate(value, index, array)) {
                res.push(value);
                index.unshift(i);
            }
        }

        for (var temp of index) {
            array.splice(temp, 1);
        }
        return res;
    }

    // 反转 array，使得第一个元素变为最后一个元素，第二个元素变为倒数第二个元素，依次类推。
    // 会改变原数组 array
    _.reverseArray = function(array) {
        var length = array.length;
        var halfLen = Math.floor(length / 2);
        if (length === 0) return [];

        for (var i = 0; i < halfLen; i++) {
            var temp = array[i];
            array[i] = array[length-i-1];
            array[length-i-1] = temp;
        }

        return array;
    }

    // ----------String------------------//

    // 字符串反转
    _.reverse = function(string) {
        return string.split('').reverse().join('');
    };

    // -------Functions --------//

    // 延迟触发某方法
    _.delay = function(func, wait) {
        var args  = slice.call(arguments, 2);

        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    };

    // 返回一个 predicate 方法的对立方法
    _.negate = function(predicate) {
        return function() {
            return !predicate.apply(this, arguments);
        };
    };

    // 返回函数集 functions 组合后的复合函数
    _.compose = function() {
        var args = arguments,
        start = args.length - 1;

        return function() {
            var i = start,
            res = args[start].apply(this, arguments);

            while(i--) {
                res = args[i].call(this, res);
            }
            return res;
        };
    };

    // 创建一个函数, 只有在运行了 count 次之后才有效果
    _.after = function(times, func) {
        return function() {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    // 创建一个函数,调用不超过count 次。 当count已经达到时，最后一个函数调用的结果 是被记住并返回 。
    _.before = function(tiems, func) {
        var temp;
        return function() {
            if (--times > 0) {
                temp = func.apply(this, arguments);
            }
            if (tiems <= 1) {
                func = null;
            }
            return temp;
        };
    };

    // -------Objects--------//

    // 判断对象中是否有指定 key
    _.has = function(obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
    };

    _.property = property;

    // 返回一个对象的 keys 组成的数组
    _.keys = function(obj) {
        if (!_.isObject(obj)) return [];

        if (nativeKeys) return nativeKeys(obj);

        var keys = [];
        for (var key in obj) {
            if (!_.has(obj, key)) {
                keys.push(key);
            }
        }

        return keys;
    };

    _.allKeys = function(obj) {
        if (!_.isObject(obj)) return [];

        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    }

    // 返回object对象所有的属性值。
    // _.values({one: 1, two: 2, three: 3});
    // ==> [1, 2, 3]
    _.values = function(obj) {
        var keys = _.keys(obj),
        length = keys.length,
        values = Array(length);

        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }

        return values;
    };

    // 将一个对象转换为元素为 [key, value] 形式的数组
    // _.pairs({one: 1, two: 2, three: 3});
    // (3) [Array(2), Array(2), Array(2)]
    //     0: (2) ["one", 1]
    //     1: (2) ["two", 2]
    //     2: (2) ["three", 3]
    _.pairs = function(obj) {
        var keys = _.keys(obj),
        length = keys.length,
        pairs = Array(length);

        for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
        }

        return pairs;
    };

    // 返回一个object副本，使其键（keys）和值（values）对换
    // _.invert({Moe: "Moses", Larry: "Louis", Curly: "Jerome"});
    // ==> {Moses: "Moe", Louis: "Larry", Jerome: "Curly"}
    _.invert = function(obj) {
        var res = {},
        keys = _.keys(obj);

        for (var i = 0, length = keys.length; i < length; i++) {
            res[obj[keys[i]]] = keys[i];
        }

        return res;
    };

    _.extend = createAssigner(_.allKeys);

    _.extendOwn = createAssigner(_.keys);

    // 返回一个object副本，只过滤出keys(有效的键组成的数组)参数指定的属性值。
    // 或者接受一个判断函数，指定挑选哪个key。
    _.pick = function(object, oiteratee, context) {
        var res = {},
        obj = object,
        iteratee,
        keys;

        if (obj == null) return res;

        if (_.isFunction(oiteratee)) {
            // 如果是函数
            keys = _.allKeys(obj);
            iteratee = optimizeCb(oiteratee, context);
        } else {
            // 不是函数，展开参数
            keys = flatten(arguments, false, false, 1);
            // 转为函数判断，iteratee 返回的是 false/true
            iteratee = function(value, key, obj) {
                return key in obj;
            };
            obj = Object(obj);
        }

        // 这里遍历 object 取出符合条件的
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i],
            value = obj[key];

            if (iteratee(value, key, obj)) {
                res[key] = value;
            }
        }

        return res;
    };

    _.omit = function(obj, iteratee, context) {

    }

    _.matcher = function(attrs) {
        attrs = _.extendOwn({}, attrs);
        return function(obj) {
            return _.isMatch(obj, attrs);
        };
    };

    _.isMatch = function(object, attrs) {
        var keys = _.keys(attrs), length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }

        return true;
    }


    //---------Utility---------//

    _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
    };

    // 返回与传入参数相等的值. 相当于数学里的: f(x) = x
    _.identity = function(value) {
        return value;
    };

    // 
    _.constant = function(value) {
        return function() {
            return value;
        };
    };

    // 返回一个 min 和 max 之间的随机整数。如果你只传递一个参数，那么将返回 0 和这个参数之间的整数。
    _.random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // 返回undefined，不论传递给它的是什么参数。
    _.noop = function() {};

    // 返回当前时间的 "时间戳"（单位 ms）
    _.now = Date.now || function() {
        return new Date().getTime();
    };

    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };

    var unescapeMap = _.invert(escapeMap);

    var createEscaper = function(map) {
        var escaper = function(match) {
            return map[match];
        }

        var source = '(?:' + _.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function(string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };

    // // 转义HTML字符串，替换&, <, >, ", ', 和 /字符。
    _.escape = createEscaper(escapeMap);
    // 转义HTML字符串，替换&, &lt;, &gt;, &quot;, &#96;, 和 &#x2F
    _.unescape = createEscaper(unescapeMap);

    // 如果对象 object 中的属性 property 是函数, 则调用它, 否则, 返回它
    _.result = function(object, property, fallback) {
        var value = object == null ? void 0 : object[property];

        if (value === void 0) {
            value = fallback;
        }
        return _.isFunction(value) ? value.call(object) : value
    }

    //-----------------------------------------------------------------------//
    // 在 _.mixin(_) 前添加自己定义的方法
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

    // // 兼容 AMD 规范
    if (typeof define === 'function' && define.amd) {
        define('underscore', [], function() {
            return _;
        });
    }

})();
