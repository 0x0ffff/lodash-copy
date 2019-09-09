# copy

根据 [冴羽的博客-underscore 系列](https://github.com/mqyqingfeng/Blog/labels/underscore%E7%B3%BB%E5%88%97) 模仿的 underscore。为了锻炼和加深 JS 的学习和练习。

## 防抖和节流

throttle 和 debounce 的应用场景应该是分的很清楚的

- debounce：把触发非常频繁的事件（比如按键）合并成一次执行。
- throttle：保证每 X 毫秒恒定的执行次数，比如每200ms检查下滚动位置，并触发 CSS 动画。

```js
// 简版 debounce
function debounce(method, context) {
    var timer = null;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            method.call(context);
        }, 1000);
    }
}

// 调用
function print() {
    consolo.log("hello");
}

window.onsrcoll = debounce(print);
// 在窗口内滚动一次，停止，1000ms 后，打印了 hello
```

- 按一个按钮发送 AJAX：给 click 加了 debounce 后就算用户不停地点这个按钮，也只会最终发送一次；如果是 throttle 就会间隔发送几次
- 监听滚动事件判断是否到页面底部自动加载更多：给 scroll 加了 debounce 后，只有用户停止滚动后，才会判断是否到了页面底部；如果是 throttle 的话，只要页面滚动就会间隔一段时间判断一次
