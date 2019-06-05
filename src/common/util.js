// 获取事件位置
export const getEventPosition = ev => {
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
  export const removeItemFromArrayByKey = (arr, key, value) => {
    const result = [];

    arr &&
      arr.forEach(item => {
        if (item[key] !== value) {
          result.push(item);
        }
      });

    return result;
  }