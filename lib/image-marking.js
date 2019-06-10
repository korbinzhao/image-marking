"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _snapSvg = require("imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js");

var _snapSvg2 = _interopRequireDefault(_snapSvg);

var _v = require("uuid/v1");

var _v2 = _interopRequireDefault(_v);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _comContextMenu = require("com-context-menu");

var _comContextMenu2 = _interopRequireDefault(_comContextMenu);

var _base = require("./resources/base64");

var _util = require("./common/util");

require("./image-marking.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// import Snap from "snapsvg";


var ImageMarking = function (_React$Component) {
  _inherits(ImageMarking, _React$Component);

  function ImageMarking(props) {
    _classCallCheck(this, ImageMarking);

    var _this = _possibleConstructorReturn(this, (ImageMarking.__proto__ || Object.getPrototypeOf(ImageMarking)).call(this, props));

    _this.getShapesData = function () {
      return _this.state.shapesData;
    };

    _this.select = function (query) {
      return _this.snap.select(query);
    };

    _this.selectAll = function (query) {
      return _this.snap.selectAll(query);
    };

    _this.onDragMove = function (dx, dy, x, y, e) {
      var drawing = _this.state.drawing;


      if (drawing) {
        return false;
      }

      (0, _util.throttle)(function () {
        var shapesData = _this.state.shapesData;


        console.log("onDragMove", dx, dy);

        // 更新当前元素的位置
        shapesData && shapesData.forEach(function (shape) {
          if (_this.dragStartInfo.shapeId === shape.shape_id) {
            shape.points && shape.points.forEach(function (point, pointIndex) {
              point[0] = _this.dragStartInfo.startPoints[pointIndex][0] + dx;
              point[1] = _this.dragStartInfo.startPoints[pointIndex][1] + dy;
            });
          }
        });

        _this.setState({
          shapesData: shapesData
        }, function () {
          _this.drawShapes(shapesData);
        });
      }, 10, _this.timer);
    };

    _this.onDragStart = function (x, y, e) {
      var _this$state = _this.state,
          shapesData = _this$state.shapesData,
          drawing = _this$state.drawing;


      if (drawing) {
        return false;
      }

      console.log("onDragStart", x, y);

      var target = e.target;


      var element = (0, _snapSvg2.default)(target);
      var shapeId = element.node.getAttribute("shape_id");

      var position = (0, _util.getEventPosition)(e);

      var currentShape = (0, _util.getItemFromArrayByKey)(shapesData, "shape_id", shapeId);

      // 当前拖拽的图形信息
      _this.dragStartInfo = {
        shapeId: shapeId,
        shape: currentShape,
        startX: position.x,
        startY: position.y,
        startPoints: JSON.parse(JSON.stringify(currentShape.points))
      };
    };

    _this.onDragEnd = function (e) {
      var _this$state2 = _this.state,
          shapesData = _this$state2.shapesData,
          drawing = _this$state2.drawing;


      if (drawing) {
        return false;
      }

      console.log("onDragEnd");

      var _this$props = _this.props,
          onChange = _this$props.onChange,
          onShapeMove = _this$props.onShapeMove;
      var shape = _this.dragStartInfo.shape;

      onShapeMove(shape);
      onChange(shapesData);
    };

    _this.endDrawing = function (e) {
      console.log("endDrawing");

      // const position = getEventPosition(e);

      // this.addPoint(position);

      _this.setState({
        drawing: false
      });

      var onChange = _this.props.onChange;
      var shapesData = _this.state.shapesData;

      onChange(shapesData);
    };

    _this.addEdge = function (e) {
      var position = (0, _util.getEventPosition)(e);

      _this.addPoint(position);
    };

    _this.drawLine = function (e) {
      var position = (0, _util.getEventPosition)(e);

      var _this$state3 = _this.state,
          drawing = _this$state3.drawing,
          shapesData = _this$state3.shapesData;


      if (drawing) {
        // const tempData = JSON.parse(JSON.stringify(shapesData));
        var tempData = shapesData;

        var length = tempData && tempData.length;

        if (length > 0) {
          tempData[length - 1].points.pop();
          tempData[length - 1].points.push([position.x, position.y]);

          _this.drawShapes(tempData);
        }
      }
    };

    _this.addPoint = function (position) {
      console.log("addPoint", position);

      var _this$state4 = _this.state,
          shapesData = _this$state4.shapesData,
          drawing = _this$state4.drawing;

      var length = shapesData && shapesData.length;

      if (drawing && length) {
        shapesData[length - 1].points.push([position.x, position.y]);
        _this.setState({
          shapesData: shapesData
        }, function () {
          _this.drawShapes(shapesData);
        });
      }
    };

    _this.getElementsActived = function () {
      return _this.snap.selectAll(".com-marking-shape.active");
    };

    _this.onOperateBtnClick = function (shapeType) {
      switch (shapeType) {
        case "group":
          var onGroup = _this.props.onGroup;

          var shapes = _this.getElementsActived();
          onGroup(shapes);
          break;
        default:
          _this.addNewShape(shapeType);
          break;
      }
    };

    _this.addNewShape = function (shapeType) {
      var shapesData = _this.state.shapesData;


      shapesData.push({
        shape_type: shapeType,
        shape_id: (0, _v2.default)(),
        points: []
      });

      _this.setState({
        drawing: true,
        shapeType: shapeType,
        shapesData: shapesData
      });
    };

    _this.onMousemove = function (e) {
      var drawing = _this.state.drawing;

      if (drawing) {
        _this.drawLine(e);
      }
    };

    _this.clearElementActive = function () {
      var elements = _this.getElementsActived();

      elements && elements.forEach(function (element) {
        (0, _snapSvg2.default)(element).attr({
          class: "com-marking-shape"
        });
      });
    };

    _this.onElementClick = function (e) {
      var _this$state5 = _this.state,
          isShiftKeyDown = _this$state5.isShiftKeyDown,
          drawing = _this$state5.drawing;


      if (!drawing) {
        e.stopPropagation();

        if (!isShiftKeyDown) {
          _this.clearElementActive();
        }

        var target = e.target;

        var element = (0, _snapSvg2.default)(target);

        element.attr({
          class: "com-marking-shape active"
        });

        var onShapeClick = _this.props.onShapeClick;

        onShapeClick(element);

        if (isShiftKeyDown) {
          var onShiftShapeClick = _this.props.onShiftShapeClick;

          var elements = _this.getElementsActived();
          onShiftShapeClick(elements);
        }
      }
    };

    _this.onElementDblClick = function (e) {
      var drawing = _this.state.drawing;

      if (!drawing) {
        var target = e.target;

        var element = (0, _snapSvg2.default)(target);

        element.attr({
          class: "com-marking-shape active"
        });

        var onShapeDblClick = _this.props.onShapeDblClick;

        onShapeDblClick(element);
      }
    };

    _this.onSvgClick = function (e) {
      clearTimeout(_this.clickTimer);

      // 通过延迟执行单击逻辑，来解决单双击事件逻辑相互干扰问题
      _this.clickTimer = setTimeout(function () {
        var drawing = _this.state.drawing;


        if (drawing) {
          _this.addEdge(e);
        } else {
          _this.clearElementActive();
        }

        var onContainerClick = _this.props.onContainerClick;

        onContainerClick(e);
      }, 200);
    };

    _this.onSvgDblclick = function (e) {
      clearTimeout(_this.clickTimer);

      var drawing = _this.state.drawing;


      if (drawing) {
        _this.endDrawing(e);
      }

      var onContainerDblClick = _this.props.onContainerDblClick;

      onContainerDblClick(e);
    };

    _this.onDelete = function () {
      var elements = _this.snap.selectAll(".com-marking-shape.active");
      var shapesData = _this.state.shapesData;


      elements && elements.forEach(function (ele) {
        (0, _snapSvg2.default)(ele).remove();
        var shapeId = ele.node.getAttribute("shape_id");
        shapesData = (0, _util.removeItemFromArrayByKey)(shapesData, "shape_id", shapeId);
      });

      _this.setState({
        shapesData: shapesData
      }, function () {
        var _this$props2 = _this.props,
            onShapesDelete = _this$props2.onShapesDelete,
            onChange = _this$props2.onChange;

        onShapesDelete(elements);
        onChange(shapesData);
      });
    };

    _this.onKeyDownListener = function () {
      window.addEventListener("keydown", _this.onShiftKeyDown);
    };

    _this.onShiftKeyDown = function (e) {
      // 按下 shift 键
      if (e.keyCode === 16) {
        _this.setState({
          isShiftKeyDown: true
        });
      }
    };

    _this.onContextMenuTargetRightClick = function (target) {
      var columns = void 0;
      if (target.classList.contains("com-marking-shape")) {
        columns = _this.shapeContextMenuColumns;
      } else if (target.classList.contains("image-remarking-svg")) {
        columns = _this.containerContextMenuColumns;
      }

      _this.highlightShape(target);

      _this.setState({
        contextMenuColumns: columns
      });
    };

    _this.state = {
      shapesData: props.dataSource,
      drawing: false, // 是否处于绘制图形状态
      isShiftKeyDown: false, // 当前 shift 键是否被按下
      activeShapes: []
    };

    _this.timer = { id: null }; // 用于节流阀函数
    _this.snap = null; // Snap 实例
    _this.clickTimer = null; // 点击事件 timer，用于区分单双击

    _this.shapeContextMenuColumns = [
    //自定义右键菜单的内容
    {
      name: "成组",
      key: "group",
      underLine: true, //是否有分割线
      onClick: function onClick(e) {
        console.log(e, "group");
        var onGroup = _this.props.onGroup;

        var shapes = _this.getElementsActived();
        onGroup(shapes);
      }
    }, {
      name: "删除",
      key: "delete",
      onClick: function onClick(e) {
        _this.onDelete();
      }
    }];
    _this.containerContextMenuColumns = [
    //自定义右键菜单的内容
    {
      name: "创建多边形",
      key: "polygon",
      underLine: true, //是否有分割线
      onClick: function onClick(e) {
        _this.addNewShape("polygon");
      }
    }, {
      name: "创建线条",
      key: "polyline",
      underLine: true, //是否有分割线
      onClick: function onClick(e) {
        _this.addNewShape("polyline");
      }
    }];
    return _this;
  }

  _createClass(ImageMarking, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.onKeyDownListener();

      var className = this.props.className;

      // 用于容器 className 自定义，防止相同类名干扰问题

      var selector = void 0; // SVG 容器选择器
      if (className) {
        selector = ".com-image-remarking-container." + className + " .image-remarking-svg";
      } else {
        selector = ".com-image-remarking-container .image-remarking-svg";
      }

      this.snap = (0, _snapSvg2.default)(selector);

      this.snap.click(this.onSvgClick);
      this.snap.dblclick(this.onSvgDblclick);
      this.snap.mousemove(this.onMousemove);

      var dataSource = this.props.dataSource;


      this.drawShapes(dataSource);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener("keydown", this.onShiftKeyDown);
    }

    /**
     * 获取当前画布信息
     */

  }, {
    key: "drawShapes",


    /**
     * 根据传入数据绘制所有图形
     * @param {Array} shapesData
     */
    value: function drawShapes(shapesData) {
      var _this2 = this;

      // 情况画布
      this.snap.paper.clear();

      shapesData.forEach(function (shape, shapeIndex) {
        _this2.drawShap(shape);
      });
    }

    /**
     * 绘制单个图形
     * @param {Object} shape
     */

  }, {
    key: "drawShap",
    value: function drawShap(shape) {
      var points = [];

      shape.points.forEach(function (point) {
        points = points.concat(point);
      });

      var attr = void 0;

      switch (shape.shape_type) {
        case "polygon":
          // 多边形
          attr = {
            stroke: "#1678E6",
            strokeWidth: 1,
            fill: "#044B9410",
            class: "com-marking-shape",
            shape_id: shape.shape_id || (0, _v2.default)()
          };

          this.snap.paper.polygon(points).attr(attr).click(this.onElementClick).dblclick(this.onElementDblClick).drag(this.onDragMove, this.onDragStart, this.onDragEnd);

          break;
        case "polyline":
          attr = {
            stroke: "#1678E6",
            strokeWidth: 1,
            fill: "#044B9410",
            fillOpacity: 0,
            class: "com-marking-shape",
            shape_id: shape.shape_id || (0, _v2.default)()
          };

          this.snap.paper.polyline(points).attr(attr).click(this.onElementClick).dblclick(this.onElementDblClick).drag(this.onDragMove, this.onDragStart, this.onDragEnd);

          break;
        default:
          break;
      }
    }

    /**
     * 根据选择器获取某个图形
     * @param {*} query
     */


    /**
     * 根据选择器获取批量图形
     * @param {*} query
     */

  }, {
    key: "highlightShapesBySelector",


    /**
     * 根据 selector 批量高亮图形
     * @param {*} selector css 选择器
     */
    value: function highlightShapesBySelector(selector) {
      var _this3 = this;

      var shapes = this.snap.selectAll(selector);

      shapes.forEach(function (shape) {
        _this3.highlightShape(shape.node);
      });

      return shapes;
    }

    /**
     * 高亮某个图形
     * @param {*} dom dom
     */

  }, {
    key: "highlightShape",
    value: function highlightShape(dom) {
      dom.classList.add("active");
    }

    /**
     * drag move event
     * @param {number} dx shift by x from the start point
     * @param {number} dy shift by y from the start point
     * @param {number} x x position of the mouse
     * @param {number} y y position of the mouse
     * @param {Event} e 事件
     */


    /**
     * drag start event
     * @param {*} x x 坐标
     * @param {*} y y 坐标
     * @param {*} e 事件
     */


    /**
     * drag end event
     * @param {*} x x 坐标
     * @param {*} y y 坐标
     * @param {*} e 事件
     */


    // 结束绘制


    // 增加边线


    // 绘制连线


    // 增加顶点

  }, {
    key: "setShapeAttr",


    /**
     * 设置图形属性
     * @param {string} selector css选择器
     * @param {object} attr 属性对象
     */
    value: function setShapeAttr(selector, attr) {
      var element = this.snap.select(selector);
      (0, _snapSvg2.default)(element).attr(attr);
    }

    /**
     * 获取当前所有选中图形
     */


    /**
     * 操作按钮点击
     * @param {string} shapeType 图形类型，polygon 或 polyline
     */


    /**
     * 新增新的图形
     * @param {string} shapeType 图形类型，polygon 或 polyline
     */


    // 鼠标移动事件


    /**
     * 清除当前所有元素的选中状态
     */


    // 图形点击事件


    // 图形双击事件


    // SVG 点击事件


    // SVG 双击事件


    // 元素删除事件


    // 键盘事件监听


    // shift按键键盘事件监听


    /**
     * 右键事件被触发
     */

  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var className = this.props.className;
      var contextMenuColumns = this.state.contextMenuColumns;


      return _react2.default.createElement(
        "div",
        { className: "com-image-remarking-container " + className },
        _react2.default.createElement(
          "div",
          { className: "operate-bar" },
          "\u2003",
          _react2.default.createElement("img", {
            src: _base.POLYGON_ICON,
            onClick: function onClick() {
              return _this4.onOperateBtnClick("polygon");
            }
          }),
          "\u2002",
          _react2.default.createElement("img", {
            src: _base.POLYLINE_ICON,
            onClick: function onClick() {
              return _this4.onOperateBtnClick("polyline");
            }
          }),
          "\u2002",
          _react2.default.createElement("img", {
            src: _base.GROUP_ICON,
            onClick: function onClick() {
              return _this4.onOperateBtnClick("group");
            }
          }),
          "\u2002",
          _react2.default.createElement("img", { src: _base.DELETE_ICON, onClick: this.onDelete })
        ),
        _react2.default.createElement("svg", { className: "image-remarking-svg" }),
        _react2.default.createElement(_comContextMenu2.default, {
          actionScopeClassName: "com-marking-shape,image-remarking-svg" // 右键时出现自定义菜单的区域的类名 class
          , columns: contextMenuColumns // 右键菜单的内容
          , onTargetRightClick: this.onContextMenuTargetRightClick
        })
      );
    }
  }]);

  return ImageMarking;
}(_react2.default.Component);

ImageMarking.propTypes = {
  dataSource: _propTypes2.default.array, // 数据
  className: _propTypes2.default.string, // 自定义类名
  onContainerClick: _propTypes2.default.func, // 容器单击事件
  onContainerDblClick: _propTypes2.default.func, // 容器双击时间
  onShapeClick: _propTypes2.default.func, // 图形单击事件
  onShapeDblClick: _propTypes2.default.func, // 图形双击事件
  onShapesDelete: _propTypes2.default.func, // 图形批量删除事件
  onShiftShapeClick: _propTypes2.default.func, // 按住 shift 键情况下的单击事件
  onShapeMove: _propTypes2.default.func, // 图形移动事件
  onGroup: _propTypes2.default.func, // 组合功能触发事件
  onChange: _propTypes2.default.func // 画布变更事件，出现图形的增删、位置移动等
};
ImageMarking.defaultProps = {
  dataSource: [],
  className: "",
  onContainerClick: function onContainerClick() {},
  onContainerDblClick: function onContainerDblClick() {},
  onShapeClick: function onShapeClick() {},
  onShapeDblClick: function onShapeDblClick() {},
  onShapesDelete: function onShapesDelete() {},
  onShiftShapeClick: function onShiftShapeClick() {},
  onShapeMove: function onShapeMove() {},
  onGroup: function onGroup() {},
  onChange: function onChange() {}
};
exports.default = ImageMarking;