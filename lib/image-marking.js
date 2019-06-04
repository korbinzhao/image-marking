"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _snapsvg = require("snapsvg");

var _snapsvg2 = _interopRequireDefault(_snapsvg);

var _v = require("uuid/v1");

var _v2 = _interopRequireDefault(_v);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _base = require("./resources/base64");

require("./image-marking.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DrawBoard = function (_React$Component) {
  _inherits(DrawBoard, _React$Component);

  function DrawBoard(props) {
    _classCallCheck(this, DrawBoard);

    var _this = _possibleConstructorReturn(this, (DrawBoard.__proto__ || Object.getPrototypeOf(DrawBoard)).call(this, props));

    _this.addEdge = function (e) {
      var position = _this.getEventPosition(e);

      console.log(position);

      var _this$state = _this.state,
          drawing = _this$state.drawing,
          shapesData = _this$state.shapesData;


      if (drawing) {
        _this.addPoint(position);

        _this.drawShapes(shapesData);
      }
    };

    _this.endDrawing = function (e) {
      var position = _this.getEventPosition(e);

      var drawing = _this.state.drawing;


      if (drawing) {
        _this.addPoint(position);

        _this.setState({
          drawing: false
        });
      }
    };

    _this.drawLine = function (e) {
      var position = _this.getEventPosition(e);

      var _this$state2 = _this.state,
          drawing = _this$state2.drawing,
          shapesData = _this$state2.shapesData;


      if (drawing) {
        var tempData = shapesData;

        var length = tempData && tempData.length;

        if (length > 0) {
          tempData[length - 1].points.pop();
          tempData[length - 1].points.push([position.x, position.y]);
        }

        _this.drawShapes(tempData);
      }
    };

    _this.addPoint = function (position) {
      var shapesData = _this.state.shapesData;


      var length = shapesData && shapesData.length;

      if (length > 0) {
        shapesData[length - 1].points.push([position.x, position.y]);
      }

      _this.setState({
        shapesData: shapesData
      }, function () {
        console.log(_this.state.shapesData);
      });
    };

    _this.getEventPosition = function (ev) {
      var x, y;
      if (ev.layerX || ev.layerX == 0) {
        x = ev.layerX;
        y = ev.layerY;
      } else if (ev.offsetX || ev.offsetX == 0) {
        // Opera
        x = ev.offsetX;
        y = ev.offsetY;
      }
      return { x: x, y: y };
    };

    _this.onOperateBtnClick = function (shapeType) {
      var shapesData = _this.state.shapesData;


      shapesData.push({
        shape_type: shapeType,
        points: []
      });

      _this.setState({
        drawing: true,
        shapeType: shapeType,
        shapesData: shapesData
      });
    };

    _this.onMousemove = function (e) {
      _this.drawLine(e);
    };

    _this.clearElementActive = function () {
      var elements = _this.snap.selectAll(".com-marking-shape");

      elements && elements.forEach(function (element) {
        (0, _snapsvg2.default)(element).attr({
          class: "com-marking-shape"
        });
      });
    };

    _this.onElementClick = function (e) {
      e.stopPropagation();

      var target = e.target;
      var isShiftKeyDown = _this.state.isShiftKeyDown;


      if (!isShiftKeyDown) {
        _this.clearElementActive();
      }

      (0, _snapsvg2.default)(target).attr({
        class: "com-marking-shape active"
      });
    };

    _this.onSvgClick = function (e) {
      _this.addEdge(e);

      _this.clearElementActive();
    };

    _this.onSvgDblclick = function (e) {
      _this.endDrawing(e);
    };

    _this.onDelete = function () {
      var elements = _this.snap.selectAll(".com-marking-shape.active");

      elements && elements.forEach(function (ele) {
        (0, _snapsvg2.default)(ele).remove();
      });
    };

    _this.onShiftKeyDown = function () {
      window.addEventListener("keydown", function (e) {
        // 按下 shift 键
        if (e.keyCode === 16) {
          _this.setState({
            isShiftKeyDown: true
          });
        }
      });
    };

    _this.state = {
      shapesData: props.dataSource,
      drawing: false, // 是否处于绘制图形状态
      isShiftKeyDown: false, // 当前 shift 键是否被按下
      activeShapes: []
    };
    return _this;
  }

  _createClass(DrawBoard, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.snap = (0, _snapsvg2.default)("#image-remarking-svg");
      this.snap.click(this.onSvgClick);
      this.snap.dblclick(this.onSvgDblclick);
      this.snap.mousemove(this.onMousemove);

      var dataSource = this.props.dataSource;


      this.drawShapes(dataSource);

      this.onShiftKeyDown();

      // test
      window.snap = this.snap;
    }

    /**
     * 根据传入数据绘制所有图形
     * @param {*} shapesData
     */

  }, {
    key: "drawShapes",
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
     * @param {*} shape
     */

  }, {
    key: "drawShap",
    value: function drawShap(shape) {
      var points = [];

      shape.points.forEach(function (point) {
        points = points.concat(point);
      });

      switch (shape.shape_type) {
        case "polygon":
          // 多边形
          this.snap.paper.polygon(points).attr({
            stroke: "#1678E6",
            strokeWidth: 1,
            fill: "#044B9410",
            class: "com-marking-shape",
            shapeId: shape.shapeId || (0, _v2.default)()
          }).click(this.onElementClick).drag();
          break;
        case "multi_line":
          this.snap.paper.polyline(points).attr({
            stroke: "#1678E6",
            strokeWidth: 1,
            fill: "#044B9410",
            fillOpacity: 0,
            class: "com-marking-shape",
            shapeId: shape.shapeId || (0, _v2.default)()
          }).click(this.onElementClick).drag();
          break;
        default:
          break;
      }
    }

    // 增加边线


    // 结束绘制


    // 绘制连线


    // 增加顶点


    // 获取事件位置


    /**
     * 清除当前所有元素的选中状态
     */

  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var className = this.props.className;


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
              return _this3.onOperateBtnClick("polygon");
            }
          }),
          "\u2002",
          _react2.default.createElement("img", {
            src: _base.MULTI_LINE_ICON,
            onClick: function onClick() {
              return _this3.onOperateBtnClick("multi_line");
            }
          }),
          "\u2002",
          _react2.default.createElement("img", { src: _base.GROUP_ICON }),
          "\u2002",
          _react2.default.createElement("img", { src: _base.DELETE_ICON, onClick: this.onDelete })
        ),
        _react2.default.createElement("svg", { id: "image-remarking-svg", className: "image-remarking-svg" })
      );
    }
  }]);

  return DrawBoard;
}(_react2.default.Component);

DrawBoard.propTypes = {
  dataSource: _propTypes2.default.array.isRequired, // 数据
  className: _propTypes2.default.string.isRequired // 自定义类名
};
exports.default = DrawBoard;