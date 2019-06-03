import React, { Component } from "react";

import SHAPES_DATA from "./shapes";

import "./image-marking.less";

class ImageMarking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drawing: false,
      shapeType: "polygon",
      shapesData: SHAPES_DATA
    };
  }

  componentDidMount() {
    this.canvas = document.getElementById("canvas-container");
    this.ctx = this.canvas.getContext("2d");

    if (this.canvas.getContext) {
      const { shapesData } = this.state;
      this.drawShapes(shapesData);
      this.eventListener();
    }
  }

  /**
   * 根据画布数据绘制形状
   * @param {*} shapesData 
   * @param {*} isLast 
   */
  drawShapes(shapesData, isLast) {
    // 清空画布
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);


    const { shapeType, drawing } = this.state;

    const length = shapesData && shapesData.length;

    shapesData.forEach((shape, shapeIndex) => {
      this.drawShape(shape);

      if (shapeType === "polygon" && (isLast || (shapeIndex === (length - 1) && !drawing))) {
        this.ctx.closePath();
      }
    });

  }

  /**
   * 绘制单个形状
   * @param {*} shape 
   */
  drawShape(shape) {
    this.ctx.beginPath();

    this.ctx.strokeStyle = shape.color;

    shape.points.forEach((point, pointIndex) => {
      if (pointIndex === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });

    this.ctx.stroke();

  }

  onOperateBtnClick = shapeType => {
    const { shapesData } = this.state;

    shapesData.push({
      type: shapeType,
      points: []
    });

    this.setState({
      drawing: true,
      shapeType,
      shapesData
    });
  };

  eventListener = () => {
    this.ctx.canvas.addEventListener("click", e => {
      this.addEdge(e);
      this.chooseShape(e);
    }, false);

    this.ctx.canvas.addEventListener("dblclick", e => {
      this.endDrawing(e);
    });

    this.ctx.canvas.addEventListener("mousemove", e => {
      this.drawLine(e);
    });
  };

  /**
   * 选择形状
   */
  chooseShape = (e) => {
    const position = this.getEventPosition(e);
    
    const isPath = this.ctx.isPointInPath(position.x, position.y);

    console.log('isPath', isPath);
  }

  // 增加边线
  addEdge = e => {
    const position = this.getEventPosition(e);

    console.log(position);

    const { drawing, shapesData } = this.state;

    if (drawing) {
      this.addPoint(position);

      this.drawShapes(shapesData);
    }
  };

  // 结束绘制
  endDrawing = e => {
    const position = this.getEventPosition(e);

    const { drawing, shapesData } = this.state;

    if (drawing) {
      this.addPoint(position);

      const isLast = true; // 是否是本次绘制的最后一个点

      this.drawShapes(shapesData, isLast);

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
        tempData[length - 1].points.push(position);
      }
      this.drawShapes(tempData);
    }
  };

  // 增加顶点
  addPoint = position => {
    const { shapesData } = this.state;

    const length = shapesData && shapesData.length;

    if (length > 0) {
      shapesData[length - 1].points.push(position);
    }

    this.setState(
      {
        shapesData
      },
      () => {
        console.log(this.state.shapesData);
      }
    );
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

  render() {
    return (
      <div className="container">
        <div className="content">
          <canvas
            className="canvas-container"
            id="canvas-container"
            width="350"
            height="350"
          />

          <div className="operators">
            <span
              className="click-btn polygon"
              onClick={() => {
                this.onOperateBtnClick("polygon");
              }}
            >
              多边形
            </span>
            <span
              className="click-btn broken-line"
              onClick={() => {
                this.onOperateBtnClick("broken_line");
              }}
            >
              线条
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default ImageMarking;
