import React, { Component } from "react";
import ImageMarking from "../src/index";
import MARKING_DATA from "./data";

export default class Demo extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    setTimeout(() => {
      this.refs.imageMarking.setShapeAttr("id001", { fill: "red" });
    }, 1000);
  }

  onContainerClick(e) {
    console.log("onContainerClick", e);
  }

  onContainerDblClick(e) {
    console.log("onContainerDblClick", e);
  }

  onShapeClick(e) {
    console.log("onShapeClick", e);
  }

  onShapeDblClick(e) {
    console.log("onShapeDblClick", e);
  }

  onShapesDelete(elements) {
    console.log("onShapesDelete", elements);
  }

  onShiftClick(e) {
    console.log("onShiftClick", e);
  }

  render() {
    return (
      <div className="demo-container">
        <img
          className="demo-image"
          src="https://img.alicdn.com/tfs/TB1ICO3bA5E3KVjSZFCXXbuzXXa-800-533.png"
        />
        <ImageMarking
          className="custom-classname"
          ref="imageMarking"
          dataSource={MARKING_DATA.shapes}
          onContainerClick={this.onContainerClick} // 容器单击事件
          onContainerDblClick={this.onContainerDblClick} // 容器双击时间
          onShapeClick={this.onShapeClick} // 图形单击事件
          onShapeDblClick={this.onShapeDblClick} // 图形双击事件
          onShapesDelete={this.onShapesDelete} // 图形批量删除事件
          onShiftClick={this.onShiftClick} // 按住 shift 键情况下的单击事件
        />
      </div>
    );
  }
}
