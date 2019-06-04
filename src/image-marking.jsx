import React from "react";
import Snap from "snapsvg";
import uuid from "uuid/v1";
import PropTypes from "prop-types";
import {
  POLYGON_ICON,
  MULTI_LINE_ICON,
  GROUP_ICON,
  DELETE_ICON
} from "./resources/base64";

import "./image-marking.less";

class DrawBoard extends React.Component {
  static propTypes = {
    dataSource: PropTypes.array.isRequired, // 数据
    className: PropTypes.string.isRequired // 自定义类名
  };

  constructor(props) {
    super(props);

    this.state = {
      shapesData: props.dataSource,
      drawing: false, // 是否处于绘制图形状态
      isShiftKeyDown: false, // 当前 shift 键是否被按下
      activeShapes: []
    };
  }

  componentDidMount() {
    this.snap = Snap("#image-remarking-svg");
    this.snap.click(this.onSvgClick);
    this.snap.dblclick(this.onSvgDblclick);
    this.snap.mousemove(this.onMousemove);

    const { dataSource } = this.props;

    this.drawShapes(dataSource);

    this.onKeyDown();

    // test
    window.snap = this.snap;
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onShiftKeyDown);
  }

  /**
   * 根据传入数据绘制所有图形
   * @param {Array} shapesData
   */
  drawShapes(shapesData) {
    // 情况画布
    this.snap.paper.clear();

    shapesData.forEach((shape, shapeIndex) => {
      this.drawShap(shape);
    });
  }

  /**
   * 绘制单个图形
   * @param {Object} shape
   */
  drawShap(shape) {
    let points = [];

    shape.points.forEach(point => {
      points = points.concat(point);
    });

    switch (shape.shape_type) {
      case "polygon": // 多边形
        this.snap.paper
          .polygon(points)
          .attr({
            stroke: "#1678E6",
            strokeWidth: 1,
            fill: "#044B9410",
            class: "com-marking-shape",
            shapeId: shape.shapeId || uuid()
          })
          .click(this.onElementClick)
          .drag();
        break;
      case "multi_line":
        this.snap.paper
          .polyline(points)
          .attr({
            stroke: "#1678E6",
            strokeWidth: 1,
            fill: "#044B9410",
            fillOpacity: 0,
            class: "com-marking-shape",
            shapeId: shape.shapeId || uuid()
          })
          .click(this.onElementClick)
          .drag();
        break;
      default:
        break;
    }
  }

  // 增加边线
  addEdge = e => {
    const position = this.getEventPosition(e);

    const { drawing, shapesData } = this.state;

    if (drawing) {
      this.addPoint(position);

      this.drawShapes(shapesData);
    }
  };

  // 结束绘制
  endDrawing = e => {
    const position = this.getEventPosition(e);

    const { drawing } = this.state;

    if (drawing) {
      this.addPoint(position);

      this.setState({
        drawing: false
      });
    }
  };

  // 绘制连线
  drawLine = e => {
    const position = this.getEventPosition(e);

    const { drawing, shapesData } = this.state;

    if (drawing) {
      const tempData = shapesData;

      const length = tempData && tempData.length;

      if (length > 0) {
        tempData[length - 1].points.pop();
        tempData[length - 1].points.push([position.x, position.y]);
      }

      this.drawShapes(tempData);
    }
  };

  // 增加顶点
  addPoint = position => {
    const { shapesData } = this.state;

    const length = shapesData && shapesData.length;

    if (length > 0) {
      shapesData[length - 1].points.push([position.x, position.y]);
    }

    this.setState({
      shapesData
    });
  };

  // 获取事件位置
  getEventPosition = ev => {
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

  /**
   * 操作按钮点击
   * @param {string} shapeType 图形类型，polygon 或 multi_line
   */
  onOperateBtnClick = shapeType => {
    const { shapesData } = this.state;

    shapesData.push({
      shape_type: shapeType,
      points: []
    });

    this.setState({
      drawing: true,
      shapeType,
      shapesData
    });
  };

  onMousemove = e => {
    this.drawLine(e);
  };

  /**
   * 清除当前所有元素的选中状态
   */
  clearElementActive = () => {
    const elements = this.snap.selectAll(".com-marking-shape");

    elements &&
      elements.forEach(element => {
        Snap(element).attr({
          class: "com-marking-shape"
        });
      });
  };

  onElementClick = e => {
    e.stopPropagation();

    const { target } = e;

    const { isShiftKeyDown } = this.state;

    if (!isShiftKeyDown) {
      this.clearElementActive();
    }

    Snap(target).attr({
      class: "com-marking-shape active"
    });
  };

  onSvgClick = e => {
    this.addEdge(e);

    this.clearElementActive();
  };

  onSvgDblclick = e => {
    this.endDrawing(e);
  };

  onDelete = () => {
    const elements = this.snap.selectAll(".com-marking-shape.active");

    elements &&
      elements.forEach(ele => {
        Snap(ele).remove();
      });
  };

  // 键盘事件监听
  onKeyDown = () => {
    window.addEventListener("keydown", this.onShiftKeyDown);
  };

  // shift按键键盘事件监听
  onShiftKeyDown = e => {
    console.log(e.keyCode);

    // 按下 shift 键
    if (e.keyCode === 16) {
      this.setState({
        isShiftKeyDown: true
      });
    }
  };

  render() {
    const { className } = this.props;

    return (
      <div className={`com-image-remarking-container ${className}`}>
        <div className="operate-bar">
          &emsp;
          <img
            src={POLYGON_ICON}
            onClick={() => this.onOperateBtnClick("polygon")}
          />
          &ensp;
          <img
            src={MULTI_LINE_ICON}
            onClick={() => this.onOperateBtnClick("multi_line")}
          />
          &ensp;
          <img src={GROUP_ICON} />
          &ensp;
          <img src={DELETE_ICON} onClick={this.onDelete} />
        </div>
        <svg id="image-remarking-svg" className="image-remarking-svg" />
      </div>
    );
  }
}

export default DrawBoard;
