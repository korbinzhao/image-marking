import React, { Component } from "react";
import ImageMarking from "../src/index";
import MARKING_DATA from "./data";

export default class Demo extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    setTimeout(() => {
      // 根据 shapeId 设置某个图形的属性
      this.refs.imageMarking.setShapeAttr("id001", { fill: "lightblue" });

      // 获取当前所有选中图形
      const elementsActive = this.refs.imageMarking.getElementsActive();
      console.log('elementsActive', elementsActive);

    }, 3000);
  }

  onContainerClick(e) {
    console.log("onContainerClick", e);
  }

  onContainerDblClick(e) {
    console.log("onContainerDblClick", e);
  }

  onShapeClick(element) {
    // 获取图形ID shapeId
    const shapeId = element.node.getAttribute("shapeId");

    console.log("onShapeClick", shapeId, element);
  }

  onShapeDblClick(element) {
    // 获取图形ID shapeId
    const shapeId = element.node.getAttribute("shapeId");
    console.log("onShapeDblClick", shapeId, element);
  }

  onShapesDelete(elements) {
    const shapeIds = [];
    elements &&
      elements.forEach(element => {
        const shapeId = element.node.getAttribute("shapeId");
        shapeIds.push(shapeId);
      });

    console.log("onShapesDelete", shapeIds, elements);
  }

  onShiftClick(elements) {
    const shapeIds = [];
    elements &&
      elements.forEach(element => {
        const shapeId = element.node.getAttribute("shapeId");
        shapeIds.push(shapeId);
      });
    console.log("onShiftClick", shapeIds, elements);
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
