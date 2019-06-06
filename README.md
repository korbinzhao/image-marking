# image-marking
a image marking tool based on React

## API
|property|description|type|default|
|---|---|---|---|
|dataSource|数据源 data source|Array|[]|
|onChange|画布发生变化时的回调事件 canvas changed event|function|(event)=>{}|
|onContainerClick|容器单击事件 container click event |function|(event)=>{}|
|onContainerDblClick|容器双击事件 container double click event |function|(event)=>{}|
|onShapeClick|图形单击事件 shape lick event |function|()=>{element}|
|onShapeDblClick|图形双击事件 shape double click event |function|(element)=>{}|
|onShapesDelete|图形批量删除事件 shapes delete event |function|(elements)=>{}|
|onShapeMove|图形移动事件 shape move event |function|(event)=>{}|
|onShiftShapeClick|按住 shift 键情况下的单击事件 shift click event |function|(elements)=>{}|
|onGroup|组合事件 group event |function|(elements)=>{}|
|setShapeAttr|根据 shapeId 设置某个图形的属性 set shape attribute by shapeId |function|(selector, attributeObject)=>{}|
|getElementsActive|获取当前所有选中图形 get elements actived |function|()=>{}|
|select|根据选择器获取单个图形 get element by selector |function|(selector)=>{}|
|selectAll|根据选择器获取多个图形 get elements by selector |function|(selector)=>{}|
|highlightShapesBySelector|根据选择器高亮多个图形 highlight elements by selector |function|(selector)=>{}|
|getShapesData|获取当前画布数据 get data from canvas |function|()=>{}|

## DEMO
### demo.jsx
```
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
      this.refs.imageMarking.setShapeAttr("[shape_id=id003]", { fill: "lightblue"});

      // 获取当前所有选中图形
      const elementsActived = this.refs.imageMarking.getElementsActived();
      console.log("elementsActived", elementsActived);

      // 获取 ImageMarking 中的 snap 实例，可通过 snap 调用 Snapsvg API
      const snap = this.refs.imageMarking.snap;

      // 根据选择器获取单个图形
      const shape = this.refs.imageMarking.select('[shape_id=id002]');
      
      // 根据选择器获取多个图形
      const shapes = this.refs.imageMarking.selectAll('[shape_id=id002],[shape_id=id001]');

      // 根据选择器高亮多个图形
      const shapesHighlight = this.refs.imageMarking.highlightShapesBySelector('[shape_id=id002],[shape_id=id001]');

      // 获取当前画布数据
      const shapesData = this.refs.imageMarking.getShapesData();

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
    const shapeId = element.node.getAttribute("shape_id");

    console.log("onShapeClick", shapeId, element);
  }

  onShapeDblClick(element) {
    // 获取图形ID shapeId
    const shapeId = element.node.getAttribute("shape_id");
    console.log("onShapeDblClick", shapeId, element);
  }

  onShapesDelete(elements) {
    const shapeIds = [];
    elements &&
      elements.forEach(element => {
        const shapeId = element.node.getAttribute("shape_id");
        shapeIds.push(shapeId);
      });

    console.log("onShapesDelete", shapeIds, elements);
  }

  onShiftShapeClick(elements) {
    const shapeIds = [];
    elements &&
      elements.forEach(element => {
        const shapeId = element.node.getAttribute("shape_id");
        shapeIds.push(shapeId);
      });
    console.log("onShiftClick", shapeIds, elements);
  }

  onShapeMove(e){
    console.log('onShapeMove', e);
  }

  onChange(data) {
    console.log("onChange", data);
  }

  onGroup(elements){
    console.log('onGroup', elements);
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
          onChange={this.onChange} // 画布发生变化时的回调事件
          onContainerClick={this.onContainerClick} // 容器单击事件
          onContainerDblClick={this.onContainerDblClick} // 容器双击时间
          onShapeClick={this.onShapeClick} // 图形单击事件
          onShapeDblClick={this.onShapeDblClick} // 图形双击事件
          onShapesDelete={this.onShapesDelete} // 图形批量删除事件
          onShapeMove={this.onShapeMove} // 图形移动事件
          onShiftShapeClick={this.onShiftShapeClick} // 按住 shift 键情况下的单击事件
        />
      </div>
    );
  }
}

```
### data.js
```
export default {
  "version": "3.10.1",
  "flags": {},
  "shapes": [{
      "shape_id": "id001",
      "label": "ql_1",
      "line_color": null,
      "fill_color": null,
      "points": [
        [
          60,
          60
        ],
        [
          200,
          100
        ],
        [
          100,
          100
        ],
        [
          60,
          80
        ]
      ],
      "shape_type": "polygon"
    },
    {
      "shape_id": "id002",
      "label": "ql_2",
      "line_color": null,
      "fill_color": null,
      "points": [
        [
          160,
          160
        ],
        [
          200,
          200
        ],
        [
          160,
          300
        ],
        [
          217,
          216
        ],

      ],
      "shape_type": "multi_line"
    },
    {
      "shape_id": "id003",
      "label": "ql_1",
      "line_color": null,
      "fill_color": null,
      "points": [
        [362, 101],
        [439, 264],
        [629, 121]
      ],
      "shape_type": "polygon"
    },
  ]
}
```