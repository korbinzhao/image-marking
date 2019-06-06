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
import {
  getEventPosition,
  removeItemFromArrayByKey,
  getItemFromArrayByKey,
  throttle
} from "./common/util";

import "./image-marking.less";

class ImageMarking extends React.Component {
  static propTypes = {
    dataSource: PropTypes.array, // 数据
    className: PropTypes.string, // 自定义类名
    onContainerClick: PropTypes.func, // 容器单击事件
    onContainerDblClick: PropTypes.func, // 容器双击时间
    onShapeClick: PropTypes.func, // 图形单击事件
    onShapeDblClick: PropTypes.func, // 图形双击事件
    onShapesDelete: PropTypes.func, // 图形批量删除事件
    onShiftShapeClick: PropTypes.func, // 按住 shift 键情况下的单击事件
    onShapeMove: PropTypes.func, // 图形移动事件
    onChange: PropTypes.func // 画布变更事件，出现图形的增删、位置移动等
  };

  static defaultProps = {
    dataSource: [],
    className: "",
    onContainerClick: () => {},
    onContainerDblClick: () => {},
    onShapeClick: () => {},
    onShapeDblClick: () => {},
    onShapesDelete: () => {},
    onShiftShapeClick: () => {},
    onShapeMove: () => {},
    onChange: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      shapesData: props.dataSource,
      drawing: false, // 是否处于绘制图形状态
      isShiftKeyDown: false, // 当前 shift 键是否被按下
      activeShapes: []
    };

    this.timer = { id: null }; // 用于节流阀函数
    this.snap = null; // Snap 实例
  }

  componentDidMount() {
    this.onKeyDownListener();

    const { className } = this.props;

    // 用于容器 className 自定义，防止相同类名干扰问题
    let selector; // SVG 容器选择器
    if (className) {
      selector = `.com-image-remarking-container.${className} .image-remarking-svg`;
    } else {
      selector = ".com-image-remarking-container .image-remarking-svg";
    }

    this.snap = Snap(selector);

    this.snap.click(this.onSvgClick);
    this.snap.dblclick(this.onSvgDblclick);
    this.snap.mousemove(this.onMousemove);

    const { dataSource } = this.props;

    this.drawShapes(dataSource);
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

    let attr;

    switch (shape.shape_type) {
      case "polygon": // 多边形
        attr = {
          stroke: "#1678E6",
          strokeWidth: 1,
          fill: "#044B9410",
          class: "com-marking-shape",
          shape_id: shape.shape_id || uuid()
        };

        this.snap.paper
          .polygon(points)
          .attr(attr)
          .click(this.onElementClick)
          .dblclick(this.onElementDblClick)
          .drag(this.onDragMove, this.onDragStart, this.onDragEnd);

        break;
      case "multi_line":
        attr = {
          stroke: "#1678E6",
          strokeWidth: 1,
          fill: "#044B9410",
          fillOpacity: 0,
          class: "com-marking-shape",
          shape_id: shape.shape_id || uuid()
        };

        this.snap.paper
          .polyline(points)
          .attr(attr)
          .click(this.onElementClick)
          .dblclick(this.onElementDblClick)
          .drag(this.onDragMove, this.onDragStart, this.onDragEnd);

        break;
      default:
        break;
    }
  }

  /**
   * 根据选择器获取某个图形
   * @param {*} query
   */
  select = query => {
    return this.snap.select(query);
  };

  /**
   * 根据选择器获取批量图形
   * @param {*} query
   */
  selectAll = query => {
    return this.snap.selectAll(query);
  };

  /**
   * 根据 selector 批量高亮图形
   * @param {*} selector css 选择器
   */
  highlightShapesBySelector(selector) {
    const shapes = this.snap.selectAll(selector);

    shapes.forEach(shape => {
      shape.attr({
        class: "com-marking-shape active"
      });
    });

    return shapes;
  }

  /**
   * drag move event
   * @param {number} dx shift by x from the start point
   * @param {number} dy shift by y from the start point
   * @param {number} x x position of the mouse
   * @param {number} y y position of the mouse
   * @param {Event} e 事件
   */
  onDragMove = (dx, dy, x, y, e) => {
    throttle(
      () => {
        const { shapesData } = this.state;

        // 更新当前元素的位置
        shapesData &&
          shapesData.forEach(shape => {
            if (this.dragStartInfo.shapeId === shape.shape_id) {
              shape.points &&
                shape.points.forEach((point, pointIndex) => {
                  point[0] = this.dragStartInfo.startPoints[pointIndex][0] + dx;
                  point[1] = this.dragStartInfo.startPoints[pointIndex][1] + dy;
                });
            }
          });

        this.setState(
          {
            shapesData
          },
          () => {
            this.drawShapes(shapesData);
          }
        );
      },
      10,
      this.timer
    );
  };

  /**
   * drag start event
   * @param {*} x x 坐标
   * @param {*} y y 坐标
   * @param {*} e 事件
   */
  onDragStart = (x, y, e) => {
    const { target } = e;

    const element = Snap(target);
    const shapeId = element.node.getAttribute("shape_id");

    const position = getEventPosition(e);

    const { shapesData } = this.state;

    const currentShape = getItemFromArrayByKey(shapesData, "shape_id", shapeId);

    // 当前拖拽的图形信息
    this.dragStartInfo = {
      shapeId,
      shape: currentShape,
      startX: position.x,
      startY: position.y,
      startPoints: JSON.parse(JSON.stringify(currentShape.points))
    };
  };

  /**
   * drag end event
   * @param {*} x x 坐标
   * @param {*} y y 坐标
   * @param {*} e 事件
   */
  onDragEnd = e => {
    const { onChange, onShapeMove } = this.props;
    const { shapesData } = this.state;
    const { shape } = this.dragStartInfo;
    onShapeMove(shape);
    onChange(shapesData);
  };

  // 结束绘制
  endDrawing = e => {
    const position = getEventPosition(e);

    this.addPoint(position);

    this.setState({
      drawing: false
    });

    const { onChange } = this.props;
    const { shapesData } = this.state;
    onChange(shapesData);
  };

  // 增加边线
  addEdge = e => {
    const { shapesData } = this.state;

    const position = getEventPosition(e);

    this.addPoint(position);

    this.drawShapes(shapesData);
  };

  // 绘制连线
  drawLine = e => {
    const position = getEventPosition(e);

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
    const { shapesData, drawing } = this.state;

    if (drawing) {
      const length = shapesData && shapesData.length;

      if (length > 0) {
        shapesData[length - 1].points.push([position.x, position.y]);
      }

      this.setState({
        shapesData
      });
    }
  };

  /**
   * 设置图形属性
   * @param {string} selector css选择器
   * @param {object} attr 属性对象
   */
  setShapeAttr(selector, attr) {
    const element = this.snap.select(selector);
    Snap(element).attr(attr);
  }

  /**
   * 获取当前所有选中图形
   */
  getElementsActived = () => {
    return this.snap.selectAll(".com-marking-shape.active");
  };

  /**
   * 操作按钮点击
   * @param {string} shapeType 图形类型，polygon 或 multi_line
   */
  onOperateBtnClick = shapeType => {
    const { shapesData } = this.state;

    shapesData.push({
      shape_type: shapeType,
      shape_id: uuid(),
      points: []
    });

    this.setState({
      drawing: true,
      shapeType,
      shapesData
    });
  };

  // 鼠标移动事件
  onMousemove = e => {
    const { drawing } = this.state;
    if (drawing) {
      this.drawLine(e);
    }
  };

  /**
   * 清除当前所有元素的选中状态
   */
  clearElementActive = () => {
    const elements = this.getElementsActived();

    elements &&
      elements.forEach(element => {
        Snap(element).attr({
          class: "com-marking-shape"
        });
      });
  };

  // 图形点击事件
  onElementClick = e => {
    const { isShiftKeyDown, drawing } = this.state;

    if (!drawing) {
      e.stopPropagation();

      const { target } = e;

      if (!isShiftKeyDown) {
        this.clearElementActive();
      }

      const element = Snap(target);

      element.attr({
        class: "com-marking-shape active"
      });

      const { onShapeClick } = this.props;
      onShapeClick(element);

      if (isShiftKeyDown) {
        const { onShiftShapeClick } = this.props;
        const elements = this.getElementsActived();
        onShiftShapeClick(elements);
      }
    }
  };

  // 图形双击事件
  onElementDblClick = e => {
    const { drawing } = this.state;
    if (!drawing) {
      const { onShapeDblClick } = this.props;
      onShapeDblClick(e);
    }
  };

  // SVG 点击事件
  onSvgClick = e => {
    // 通过延迟执行单击逻辑，来解决单双击事件逻辑相互干扰问题
    setTimeout(() => {
      const { drawing } = this.state;

      if (drawing) {
        this.addEdge(e);
      } else {
        this.clearElementActive();
      }

      const { onContainerClick } = this.props;
      onContainerClick(e);
    }, 100);
  };

  // SVG 双击事件
  onSvgDblclick = e => {
    const { drawing } = this.state;

    if (drawing) {
      this.endDrawing(e);
    }

    const { onContainerDblClick } = this.props;
    onContainerDblClick(e);
  };

  // 元素删除事件
  onDelete = () => {
    const elements = this.snap.selectAll(".com-marking-shape.active");
    let { shapesData } = this.state;

    elements &&
      elements.forEach(ele => {
        Snap(ele).remove();
        const shapeId = ele.node.getAttribute("shape_id");
        shapesData = removeItemFromArrayByKey(shapesData, "shape_id", shapeId);
      });

    this.setState(
      {
        shapesData
      },
      () => {
        const { onShapesDelete, onChange } = this.props;
        onShapesDelete(elements);
        onChange(shapesData);
      }
    );
  };

  // 键盘事件监听
  onKeyDownListener = () => {
    window.addEventListener("keydown", this.onShiftKeyDown);
  };

  // shift按键键盘事件监听
  onShiftKeyDown = e => {
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
        <svg className="image-remarking-svg" />
      </div>
    );
  }
}

export default ImageMarking;
