"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// 获取事件位置
var getEventPosition = exports.getEventPosition = function getEventPosition(ev) {
  var x, y;
  if (ev.layerX || ev.layerX == 0) {
    x = ev.layerX;
    y = ev.layerY;
  } else if (ev.offsetX || ev.offsetX == 0) {
    // Opera
    x = ev.offsetX;
    y = ev.offsetY;
  }
  return {
    x: x,
    y: y
  };
};

/**
 * 通过 key=value 的方式删除数组中的某一项
 * @param {object[]} arr 对象数组
 * @param {*} key
 * @param {*} value
 */
var removeItemFromArrayByKey = exports.removeItemFromArrayByKey = function removeItemFromArrayByKey(arr, key, value) {
  var result = [];

  arr && arr.forEach(function (item) {
    if (item[key] !== value) {
      result.push(item);
    }
  });

  return result;
};

var getItemFromArrayByKey = exports.getItemFromArrayByKey = function getItemFromArrayByKey(arr, key, value) {
  var result = void 0;

  arr && arr.forEach(function (item) {
    if (item[key] === value) {
      result = item;
    }
  });

  return result;
};

/**
 * 函数节流方法
 * @param Function fn 延时调用函数
 * @param Number delay 延迟多长时间
 * @param Object timer {id: null}
 */
var throttle = exports.throttle = function throttle(fn, delay, timer) {
  if (timer.id) {
    clearTimeout(timer.id);
  }

  timer.id = setTimeout(function () {
    fn();
  }, delay);
};