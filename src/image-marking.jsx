import React from "react";
import Snap from "snapsvg";
import {
  POLYGAN_ICON,
  MULTI_LINE_ICON,
  GROUP_ICON,
  DELETE_ICON
} from "./resources/base64";
import PropTypes from "prop-types";

import "./image-marking.less";

class DrawBoard extends React.Component {
  constructor(props) {
    super(props);
    this.drawMultiline = null;
    this.drawPolygon = null;
  }

  componentDidMount() {
    this.snap = Snap("#image-remarking-svg");
    this.snap.click(this.onSvgClick);
    this.snap.dblclick(this.onSvgDblclick);
    this.snap.mousemove(this.onMousemove);

    const { dataSource } = this.props;

    this.drwaShapes(dataSource);
  }

  /**
   * 根据传入数据绘制所有图形
   * @param {*} shapesData 
   */
  drwaShapes(shapesData) {
    shapesData.forEach((shape, shapeIndex) => {
      this.drawShap(shape);
    });
  }

  /**
   * 绘制单个图形
   * @param {*} shape 
   */
  drawShap(shape) {
    let points = [];

    shape.points.forEach(point => {
      points = points.concat(point);
    });

    console.log('points', points);

    switch (shape.shape_type) {
      case "polygon": // 多边形
        this.snap.paper.polygon(points).attr({
          stroke: "#1678E6",
          strokeWidth: 1,
          fill: "#044B9410"
        });
        break;
      case "multi_line":
        this.snap.paper.polyline(points).attr({
          stroke: "#1678E6",
          strokeWidth: 1,
          fill: "#044B9410",
          fillOpacity: 0
        });
        break;
      default:
        break;
    }
  }

  onMultilineClick = e => {
    console.log("onMultilineClick", e);
  };

  onPolygonClick = e => {
    console.log("onPolygonClick", e);
  };

  onMousemove = e => {

    


    // const {
    //   multiline,
    //   multilinePoints,
    //   polygon,
    //   polygonPoints } = this.props;
    // const { offsetX,  offsetY } = e;
    // if (multiline && multilinePoints.length > 0) {
    //   if (this.drawMultiline) {
    //     this.drawMultiline.attr({
    //       points: [...multilinePoints, [offsetX,  offsetY]],
    //     });
    //   } else {
    //     this.drawMultiline = this.snap.polyline([...multilinePoints, [offsetX,  offsetY]]).attr({
    //       fill: 'none',
    //       stroke: "#0000ff",
    //       cursor: "pointer",
    //       strokeWidth: 2,
    //     });
    //   }
    // }
    // if (polygon && polygonPoints.length > 0) {
    //   let type = '';
    //   if (this.drawPolygon) {
    //     type = this.drawPolygon.attr('type');
    //   }
    //   if (type === 'polyline' && polygonPoints.length > 1) {
    //     this.drawPolygon.remove();
    //     this.drawPolygon = this.snap.polygon([...polygonPoints, [offsetX,  offsetY]]).attr({
    //       // fill: 'none',
    //       fill: 'rgba(255, 255, 255, 0.2)',
    //       stroke: "#0000ff",
    //       cursor: "pointer",
    //       strokeWidth: 2,
    //       type: 'polygon',
    //     });
    //     return;
    //   }
    //   if (this.drawPolygon) {
    //     this.drawPolygon.attr({
    //       points: [...polygonPoints, [offsetX,  offsetY]],
    //     });
    //   } else {
    //     this.drawPolygon = this.snap.polyline([...polygonPoints, [offsetX,  offsetY]]).attr({
    //       fill: 'none',
    //       stroke: "#0000ff",
    //       cursor: "pointer",
    //       strokeWidth: 2,
    //       type: 'polyline',
    //     });
    //   }
    // }
  };

  onElementClick = e => {
    // console.log('onElementClick', e);
    // const { target } = e;
    // const selectMark = Snap(target);
    // if (selectMark.attr('type') === 'polygon') {
    //   Snap(target).attr({
    //     fill: 'rgba(255, 255, 0, 0.2)',
    //     stroke: 'rgb(255, 255, 0)',
    //   });
    // } else {
    //   Snap(target).attr({
    //     stroke: 'rgb(255, 255, 0)',
    //   });
    // }
    // const { selectMarks, changeStateStore } = this.props;
    // changeStateStore({
    //   selectMarks: [...selectMarks, selectMark],
    // });
  };

  onSvgClick = e => {
    console.log("onSvgClick", e);

    // const {
    //   multiline,
    //   multilinePoints,
    //   polygon,
    //   polygonPoints,
    //   selectMarks,
    //   changeStateStore
    // } = this.props;
    // if (multiline) {
    //   changeStateStore({
    //     multilinePoints: [...multilinePoints, [e.offsetX, e.offsetY]]
    //   });
    // }
    // if (polygon) {
    //   changeStateStore({
    //     polygonPoints: [...polygonPoints, [e.offsetX, e.offsetY]]
    //   });
    // }
    // if (e.target.id !== "configDrawBoard" || multiline || polygon) {
    //   return;
    // }
    // for (const mark of selectMarks) {
    //   if (mark.attr("type") === "polyline") {
    //     mark.attr({
    //       fill: "none",
    //       stroke: "#0000ff"
    //     });
    //   } else {
    //     mark.attr({
    //       fill: "rgba(255, 255, 255, 0.2)",
    //       stroke: "#0000ff"
    //     });
    //   }
    // }
    // changeStateStore({
    //   selectMarks: []
    // });
  };

  onSvgDblclick = e => {
    console.log("onSvgDblclick", e);

    // const {
    //   multiline,
    //   multilinePoints,
    //   nowMultilinePoints,
    //   polygon,
    //   polygonPoints,
    //   nowPolygonPoints,
    //   allMarks,
    //   changeStateStore
    // } = this.props;
    // if (multiline && this.drawMultiline) {
    //   if (multilinePoints.length < 3) {
    //     this.drawMultiline.remove();
    //     return;
    //   }
    //   multilinePoints.pop();
    //   const name = `${new Date().getTime()}`;
    //   this.drawMultiline.attr({
    //     name,
    //     title: name,
    //     type: "polyline",
    //     points: multilinePoints
    //   });
    //   this.drawMultiline.click(this.onElementClick);
    //   allMarks.push(this.drawMultiline);
    //   this.drawMultiline.drag();
    //   this.drawMultiline = null;
    //   changeStateStore({
    //     multilinePoints: [],
    //     allMarks: [...allMarks],
    //     nowMultilinePoints: [
    //       ...nowMultilinePoints,
    //       {
    //         id: null,
    //         name,
    //         title: name,
    //         type: "polyline",
    //         points: multilinePoints
    //       }
    //     ],
    //     multiline: false,
    //     isFold: false
    //   });
    // }
    // if (polygon && this.drawPolygon) {
    //   if (polygonPoints.length < 4) {
    //     this.drawPolygon.remove();
    //     return;
    //   }
    //   polygonPoints.pop();
    //   const name = `${new Date().getTime()}`;
    //   this.drawPolygon.attr({
    //     name,
    //     title: name,
    //     type: "polygon",
    //     points: polygonPoints
    //   });
    //   this.drawPolygon.click(this.onElementClick);
    //   allMarks.push(this.drawPolygon);
    //   this.drawPolygon.drag();
    //   this.drawPolygon = null;
    //   changeStateStore({
    //     polygonPoints: [],
    //     allMarks: [...allMarks],
    //     nowPolygonPoints: [
    //       ...nowPolygonPoints,
    //       {
    //         id: null,
    //         name,
    //         title: name,
    //         type: "polygon",
    //         points: polygonPoints
    //       }
    //     ],
    //     polygon: false,
    //     isFold: false
    //   });
    // }
  };

  onDelete = e => {
    console.log("onDelete", e);

    // const { selectMarks, allMarks, changeStateStore } = this.props;
    // const filterMarks = [];
    // for (const allMark of allMarks) {
    //   let isFilter = false;
    //   for (const selectMark of selectMarks) {
    //     if (selectMark.attr("id") === allMark.attr("id")) {
    //       isFilter = true;
    //       break;
    //     }
    //   }
    //   if (!isFilter) {
    //     filterMarks.push(allMark);
    //   }
    // }
    // for (const mark of selectMarks) {
    //   mark.remove();
    // }
    // changeStateStore({
    //   selectMarks: [],
    //   allMarks: filterMarks
    // });
  };

  render() {
    const { className } = this.props;

    return (
      <div className={`com-image-remarking-container ${className}`}>
        <div className="operate-bar">
          &emsp;
          <img src={POLYGAN_ICON} onClick={this.onPolygonClick} />
          &ensp;
          <img src={MULTI_LINE_ICON} onClick={this.onMultilineClick} />
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

DrawBoard.propTypes = {
  multiline: PropTypes.bool,
  multilinePoints: PropTypes.arrayOf(PropTypes.any),
  polygon: PropTypes.bool,
  polygonPoints: PropTypes.arrayOf(PropTypes.any),
  nowMultilinePoints: PropTypes.arrayOf(PropTypes.any),
  nowPolygonPoints: PropTypes.arrayOf(PropTypes.any),
  selectMarks: PropTypes.arrayOf(PropTypes.any),
  allMarks: PropTypes.arrayOf(PropTypes.any),
  changeStateStore: PropTypes.func
};

export default DrawBoard;
