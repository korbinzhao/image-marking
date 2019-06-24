"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _modal = require("antd/es/modal");

var _modal2 = _interopRequireDefault(_modal);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require("antd/es/modal/style/css");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _snapSvg = require("imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js");

var _snapSvg2 = _interopRequireDefault(_snapSvg);

var _v = require("uuid/v1");

var _v2 = _interopRequireDefault(_v);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _deepEqual = require("deep-equal");

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _comContextMenu = require("com-context-menu");

var _comContextMenu2 = _interopRequireDefault(_comContextMenu);

var _util = require("./common/util");

require("./image-marking.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ImageMarking = function (_React$Component) {
  _inherits(ImageMarking, _React$Component);

  function ImageMarking(props) {
    _classCallCheck(this, ImageMarking);

    var _this = _possibleConstructorReturn(this, (ImageMarking.__proto__ || Object.getPrototypeOf(ImageMarking)).call(this, props));

    _this.getShapeContextMenuColumns = function () {
      var groupContext = {
        name: "成组",
        key: "group",
        underLine: true, // 是否有分割线
        onClick: function onClick(e) {
          var groupDisable = _this.state.groupDisable;

          if (!groupDisable) {
            var onGroup = _this.props.onGroup;

            var shapes = _this.getElementsActived();
            onGroup(shapes);
          }
        }
      };

      var deleteContext = {
        name: "删除",
        key: "delete",
        onClick: function onClick(e) {
          _this.onDelete();
        }
      };

      var groupDisable = _this.state.groupDisable;


      var columns = [];
      if (groupDisable) {
        columns.push(deleteContext);
      } else {
        columns.push(groupContext);
        columns.push(deleteContext);
      }
      return columns;
    };

    _this.getContainerContextMenuColumns = function () {
      return [
      // 自定义右键菜单的内容
      {
        name: "创建多边形",
        key: "polygon",
        underLine: true, // 是否有分割线
        onClick: function onClick(e) {
          _this.addNewShape("polygon");
        }
      }, {
        name: "创建线条",
        key: "polyline",
        underLine: true, // 是否有分割线
        onClick: function onClick(e) {
          _this.addNewShape("polyline");
        }
      }];
    };

    _this.getDeleteConfirm = function () {
      var deleteConfirm = _this.props.deleteConfirm;


      var defaultDeleteConfirm = _react2.default.createElement(
        _modal2.default,
        {
          title: "\u5220\u9664",
          visible: true,
          onOk: function onOk() {
            _this.setDeleteConfirmVisible(false);
            _this.deleteShapesActived();
          },
          onCancel: function onCancel() {
            _this.setDeleteConfirmVisible(false);
          },
          okText: "\u786E\u8BA4",
          cancelText: "\u53D6\u6D88"
        },
        "\u786E\u5B9A\u5220\u9664\u5417\uFF1F"
      );

      return deleteConfirm || defaultDeleteConfirm;
    };

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

      if (_this.isDraging(dx, dy)) {
        var draging = _this.state.draging;


        if (!draging) {
          _this.setState({
            draging: true
          });
        }
      }

      (0, _util.throttle)(function () {
        var shapesData = _this.state.shapesData;

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
          drawing = _this$state2.drawing,
          draging = _this$state2.draging;


      if (drawing) {
        return false;
      }

      if (draging) {
        _this.setState(
        // draging 的 setState 务必前置，否则影响画布渲染
        {
          draging: false
        }, function () {
          var onShapeMove = _this.props.onShapeMove;
          var shape = _this.dragStartInfo.shape;

          onShapeMove(shape);
          _this.onShapesDataChange(shapesData);
        });
      }
    };

    _this.endDrawing = function (e) {
      _this.setState({
        drawing: false
      }, function () {
        var shapesData = _this.state.shapesData;

        _this.onShapesDataChange(shapesData);
      });
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
      return _this.snap ? _this.snap.selectAll(".com-marking-shape.active") : [];
    };

    _this.onOperateBtnClick = function (shapeType) {
      switch (shapeType) {
        case "group":
          var onGroup = _this.props.onGroup;
          var groupDisable = _this.state.groupDisable;

          if (!groupDisable) {
            var shapes = _this.getElementsActived();
            onGroup(shapes);
          }
          break;
        default:
          var drawing = _this.state.drawing;

          if (!drawing) {
            _this.addNewShape(shapeType);
          }
          break;
      }
    };

    _this.addNewShape = function (shapeType) {
      var shapesData = _this.state.shapesData;


      var tempArr = JSON.parse(JSON.stringify(shapesData));

      tempArr.push({
        shape_type: shapeType,
        shape_id: (0, _v2.default)(),
        points: []
      });

      _this.setState({
        drawing: true,
        shapeType: shapeType,
        shapesData: tempArr
      });
    };

    _this.setDeleteConfirmVisible = function (visible) {
      _this.setState({
        isDeleteConfirmVisible: visible
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

      _this.setOperateBtnDisableState();
    };

    _this.onElementClick = function (e) {
      var _this$state5 = _this.state,
          isShiftKeyDown = _this$state5.isShiftKeyDown,
          drawing = _this$state5.drawing;


      if (!drawing) {
        e.stopPropagation();

        console.log("onElementClick");

        if (!isShiftKeyDown) {
          _this.clearElementActive();
        }

        var target = e.target;

        var element = (0, _snapSvg2.default)(target);

        _this.highlightShape(element.node);

        if (isShiftKeyDown) {
          // shift 按键按下的时候只触发 onShiftShapeClick
          var onShiftShapeClick = _this.props.onShiftShapeClick;

          var elements = _this.getElementsActived();
          onShiftShapeClick(elements);
        } else {
          var onShapeClick = _this.props.onShapeClick;

          onShapeClick(element);
        }
      }
    };

    _this.onElementDblClick = function (e) {
      var drawing = _this.state.drawing;

      if (!drawing) {
        console.log("onElementDblClick");

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

      console.log("onSvgClick");

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
      }, 100);
    };

    _this.onSvgDblclick = function (e) {
      clearTimeout(_this.clickTimer);

      console.log("onSvgDblclick");

      var drawing = _this.state.drawing;


      if (drawing) {
        _this.endDrawing(e);
      }

      var onContainerDblClick = _this.props.onContainerDblClick;

      onContainerDblClick(e);
    };

    _this.onDelete = function () {
      var deleteDisable = _this.state.deleteDisable;


      if (deleteDisable) {
        return false;
      }

      var isDeleteConfirmOpen = _this.props.isDeleteConfirmOpen;


      if (isDeleteConfirmOpen) {
        _this.setDeleteConfirmVisible(true);
      } else {
        _this.deleteShapesActived();
      }
    };

    _this.onKeyDownListener = function () {
      window.addEventListener("keydown", _this.onShiftKeyDown);
      window.addEventListener("keyup", _this.onShiftKeyUp);
    };

    _this.onShiftKeyDown = function (e) {
      // 按下 shift 键
      if (e.keyCode === 16) {
        _this.setState({
          isShiftKeyDown: true
        });
      }
    };

    _this.onShiftKeyUp = function (e) {
      // 按下 shift 键
      if (e.keyCode === 16) {
        _this.setState({
          isShiftKeyDown: false
        });
      }
    };

    _this.onContextMenuTargetRightClick = function (target) {
      var columns = void 0;
      if (target.classList.contains("com-marking-shape")) {
        columns = _this.getShapeContextMenuColumns();
      } else if (target.classList.contains("com-image-marking-container")) {
        columns = _this.getContainerContextMenuColumns();
      }

      _this.highlightShape(target);

      _this.setState({
        contextMenuColumns: columns
      });
    };

    _this.state = {
      shapesData: props.dataSource,
      drawing: false, // 是否处于绘制图形状态
      draging: false, // 是否处于图形拖动状态
      isShiftKeyDown: false, // 当前 shift 键是否被按下
      deleteDisable: true, // 是否禁用删除按钮
      groupDisable: true, // 是否禁用组合按钮
      isDeleteConfirmVisible: false
    };

    _this.timer = { id: null }; // 用于节流阀函数
    _this.snap = null; // Snap 实例
    _this.clickTimer = null; // 点击事件 timer，用于区分单双击
    return _this;
  }

  _createClass(ImageMarking, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if ((0, _deepEqual2.default)(nextProps, this.props) && (0, _deepEqual2.default)(nextState, this.state)) {
        return false;
      } else {
        return true;
      }
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      var _this2 = this;

      var dataSource = nextProps.dataSource;
      var _state = this.state,
          shapesData = _state.shapesData,
          drawing = _state.drawing;


      if (!drawing && JSON.stringify(dataSource) !== JSON.stringify(shapesData)) {

        console.log('componentWillReceiveProps', nextProps.dataSource);

        this.setState({ shapesData: dataSource }, function () {
          _this2.drawShapes(dataSource);
          _this2.setOperateBtnDisableState();
        });
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.onKeyDownListener();

      var className = this.props.className;

      // 用于容器 className 自定义，防止相同类名干扰问题

      var selector = void 0; // SVG 容器选择器
      if (className) {
        selector = ".com-image-marking-container." + className + " .com-image-marking-svg";
      } else {
        selector = ".com-image-marking-container .com-image-marking-svg";
      }

      this.snap = (0, _snapSvg2.default)(selector);

      this.snap.dblclick(this.onSvgDblclick);
      this.snap.click(this.onSvgClick);
      this.snap.mousemove(this.onMousemove);

      var shapesData = this.state.shapesData;


      this.drawShapes(shapesData);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener("keydown", this.onShiftKeyDown);
      window.removeEventListener("keyup", this.onShiftKeyUp);
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
      var _this3 = this;

      // 情况画布
      this.snap.paper.clear();

      shapesData.forEach(function (shape, shapeIndex) {
        _this3.drawShap(shape);
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

      var readOnly = this.props.readOnly;


      var attr = void 0;

      var className = "com-marking-shape";

      if (shape.highlight) {
        className = "com-marking-shape active";
      }

      switch (shape.shape_type) {
        case "polygon":
          // 多边形
          attr = {
            stroke: "#1678E6",
            strokeWidth: 1,
            fill: "#044B9410",
            class: className,
            shape_id: shape.shape_id || (0, _v2.default)()
          };

          if (readOnly) {
            this.snap.paper.polygon(points).attr(attr);
          } else {
            this.snap.paper.polygon(points).attr(attr).click(this.onElementClick).dblclick(this.onElementDblClick).drag(this.onDragMove, this.onDragStart, this.onDragEnd);
          }

          break;
        case "polyline":
          attr = {
            stroke: "#1678E6",
            strokeWidth: 1,
            fill: "#044B9410",
            fillOpacity: 0,
            class: className,
            shape_id: shape.shape_id || (0, _v2.default)()
          };

          if (readOnly) {
            this.snap.paper.polyline(points).attr(attr);
          } else {
            this.snap.paper.polyline(points).attr(attr).click(this.onElementClick).dblclick(this.onElementDblClick).drag(this.onDragMove, this.onDragStart, this.onDragEnd);
          }

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
      var _this4 = this;

      var shapes = this.snap.selectAll(selector);

      shapes.forEach(function (shape) {
        _this4.highlightShape(shape.node);
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

      this.setOperateBtnDisableState();
    }

    /**
     * 使用一个最小距离来判断图形是否在拖动
     * @param {*} dx x 轴位移
     * @param {*} dy y 轴位移
     */

  }, {
    key: "isDraging",
    value: function isDraging(dx, dy) {
      var MIN_DISTANCE = 5;
      if (Math.abs(dx) > MIN_DISTANCE || Math.abs(dy) > MIN_DISTANCE) {
        return true;
      }
      return false;
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

  }, {
    key: "setOperateBtnDisableState",
    value: function setOperateBtnDisableState() {
      var elementsActived = this.getElementsActived();

      var deleteDisable = elementsActived.length < 1;
      var groupDisable = elementsActived.length < 2;

      this.setState({
        deleteDisable: deleteDisable,
        groupDisable: groupDisable
      });
    }
  }, {
    key: "deleteShapesActived",
    value: function deleteShapesActived() {
      var _this5 = this;

      var shapesData = this.state.shapesData;

      var elements = this.snap.selectAll(".com-marking-shape.active");

      elements && elements.forEach(function (ele) {
        (0, _snapSvg2.default)(ele).remove();
        var shapeId = ele.node.getAttribute("shape_id");
        shapesData = (0, _util.removeItemFromArrayByKey)(shapesData, "shape_id", shapeId);
      });

      this.setState({
        shapesData: shapesData
      }, function () {
        var onShapesDelete = _this5.props.onShapesDelete;

        _this5.setOperateBtnDisableState();
        onShapesDelete(elements);
        _this5.onShapesDataChange(shapesData);
      });
    }

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


    // shift按键按下键盘事件监听


    // shift按键抬起键盘事件监听


    /**
     * 右键事件被触发
     */

  }, {
    key: "onShapesDataChange",
    value: function onShapesDataChange(shapesData) {
      var onChange = this.props.onChange;

      var data = this.handleShapesData(shapesData);
      onChange(data);
    }

    // 过滤掉顶点数小于2个的图形

  }, {
    key: "handleShapesData",
    value: function handleShapesData(shapesData) {
      var _this6 = this;

      var result = shapesData.filter(function (item) {
        var points = _this6.uniqueShapePoints(item.points);
        item.points = points;
        if (points.length === 1) {
          // 只有一个顶点则不保存
          return false;
        }
        return true;
      });

      return JSON.parse(JSON.stringify(result));
    }

    /**
     * 对顶点数组进行去重处理
     * @param {*} points
     */

  }, {
    key: "uniqueShapePoints",
    value: function uniqueShapePoints(points) {
      var arr1 = points.map(function (item) {
        return item.join(",");
      });
      var arr2 = Array.from(new Set(arr1));
      var result = arr2.map(function (item) {
        var arr = item.split(",");
        arr[0] *= 1;
        arr[1] *= 1;
        return arr;
      });
      return result;
    }
  }, {
    key: "render",
    value: function render() {
      var _this7 = this;

      var _props = this.props,
          className = _props.className,
          readOnly = _props.readOnly;
      var _state2 = this.state,
          contextMenuColumns = _state2.contextMenuColumns,
          deleteDisable = _state2.deleteDisable,
          groupDisable = _state2.groupDisable,
          isDeleteConfirmVisible = _state2.isDeleteConfirmVisible;


      var operationBar = _react2.default.createElement(
        "div",
        { className: "operate-bar" },
        "\u2003",
        _react2.default.createElement("i", {
          className: "iconfont-image-marking icon-duobianxing1 operation-btn",
          onClick: function onClick() {
            return _this7.onOperateBtnClick("polygon");
          }
        }),
        "\u2002",
        _react2.default.createElement("i", {
          className: "iconfont-image-marking icon-xianduan operation-btn",
          onClick: function onClick() {
            return _this7.onOperateBtnClick("polyline");
          }
        }),
        "\u2002",
        _react2.default.createElement("i", {
          className: "iconfont-image-marking icon-xingzhuangjiehe operation-btn " + (groupDisable ? "disabled" : ""),
          onClick: function onClick() {
            return _this7.onOperateBtnClick("group");
          }
        }),
        "\u2002",
        _react2.default.createElement("i", {
          className: "iconfont-image-marking icon-shanchu operation-btn " + (deleteDisable ? "disabled" : ""),
          onClick: function onClick() {
            return _this7.onDelete();
          }
        })
      );

      return _react2.default.createElement(
        "div",
        { className: "com-image-marking-container " + className },
        !readOnly ? operationBar : null,
        _react2.default.createElement("svg", { className: "com-image-marking-svg" }),
        !readOnly ? _react2.default.createElement(_comContextMenu2.default, {
          actionScopeClassName: "com-marking-shape,com-image-marking-container" // 右键时出现自定义菜单的区域的类名 class
          , columns: contextMenuColumns // 右键菜单的内容
          , onTargetRightClick: this.onContextMenuTargetRightClick
        }) : null,
        isDeleteConfirmVisible ? this.getDeleteConfirm() : null
      );
    }
  }]);

  return ImageMarking;
}(_react2.default.Component);

ImageMarking.propTypes = {
  dataSource: _propTypes2.default.array, // 数据
  className: _propTypes2.default.string, // 自定义类名
  readOnly: _propTypes2.default.bool, // 是否只读
  deleteConfirm: _propTypes2.default.element, // 自定义删除行为确认框
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
  readOnly: false,
  deleteConfirm: null,
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