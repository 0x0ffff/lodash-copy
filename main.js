(function() {
    //匿名函数
    
    //通常js对象调用已存在函数：obj.func()，若方法不存在，又不想重复定义该方法，可以使用call或apply借用
    
    //obj2借用obj1的bar方法
    //var obj1 = {}; obj1.bar = function(){...}
    //var obj2 = {}; obj.bar.call(obj1);
    
    //用call借用匿名函数，此处this可不传，参数为null或undefined时会自动指向全局对象
    //console.log(this); 浏览器下输出是Window
    
    //自执行方法，参照：(function(){...}()) 闭包封装变量和函数，不暴露局部变量，不污染全局变量，大多数库和框架都采用此结构
}.call(this));