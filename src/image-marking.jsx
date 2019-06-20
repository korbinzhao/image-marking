import React from 'react';
import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js';
import uuid from 'uuid/v1';
import PropTypes from 'prop-types';
import ContextMenu from 'com-context-menu';
import { Modal } from 'antd';
import {
  getEventPosition,
  removeItemFromArrayByKey,
  getItemFromArrayByKey,
  throttle,
} from './common/util';

import './image-marking.less';

class ImageMarking extends React.Component {
  static propTypes = {
    dataSource: PropTypes.array, // 数据
    className: PropTypes.string, // 自定义类名
    readOnly: PropTypes.bool, // 是否只读
    deleteConfirm: PropTypes.element, // 自定义删除行为确认框
    onContainerClick: PropTypes.func, // 容器单击事件
    onContainerDblClick: PropTypes.func, // 容器双击时间
    onShapeClick: PropTypes.func, // 图形单击事件
    onShapeDblClick: PropTypes.func, // 图形双击事件
    onShapesDelete: PropTypes.func, // 图形批量删除事件
    onShiftShapeClick: PropTypes.func, // 按住 shift 键情况下的单击事件
    onShapeMove: PropTypes.func, // 图形移动事件
    onGroup: PropTypes.func, // 组合功能触发事件
    onChange: PropTypes.func, // 画布变更事件，出现图形的增删、位置移动等
  };

  static defaultProps = {
    dataSource: [],
    className: '',
    readOnly: false,
    deleteConfirm: null,
    onContainerClick: () => {},
    onContainerDblClick: () => {},
    onShapeClick: () => {},
    onShapeDblClick: () => {},
    onShapesDelete: () => {},
    onShiftShapeClick: () => {},
    onShapeMove: () => {},
    onGroup: () => {},
    onChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      shapesData: props.dataSource,
      drawing: false, // 是否处于绘制图形状态
      draging: false, // 是否处于图形拖动状态
      isShiftKeyDown: false, // 当前 shift 键是否被按下
      deleteDisable: true, // 是否禁用删除按钮
      groupDisable: true, // 是否禁用组合按钮
      isDeleteConfirmVisible: false,
    };

    this.timer = { id: null }; // 用于节流阀函数
    this.snap = null; // Snap 实例
    this.clickTimer = null; // 点击事件 timer，用于区分单双击
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { dataSource } = nextProps;
    const { shapesData } = this.state;

    if (
      JSON.stringify(dataSource) === JSON.stringify(shapesData) &&
      JSON.stringify(nextState) === JSON.stringify(this.state)
    ) {
      return false;
    } else {
      return true;
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource } = nextProps;
    const { shapesData } = this.state;

    if (JSON.stringify(dataSource) !== JSON.stringify(shapesData)) {
      this.setState({ shapesData: dataSource }, () => {
        this.drawShapes(dataSource);
        this.setOperateBtnDisableState();
      });
    }
  }

  componentDidMount() {
    this.onKeyDownListener();

    const { className } = this.props;

    // 用于容器 className 自定义，防止相同类名干扰问题
    let selector; // SVG 容器选择器
    if (className) {
      selector = `.com-image-marking-container.${className} .com-image-marking-svg`;
    } else {
      selector = '.com-image-marking-container .com-image-marking-svg';
    }

    this.snap = Snap(selector);

    this.snap.click(this.onSvgClick);
    this.snap.dblclick(this.onSvgDblclick);
    this.snap.mousemove(this.onMousemove);

    const { shapesData } = this.state;

    this.drawShapes(shapesData);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onShiftKeyDown);
    window.removeEventListener('keyup', this.onShiftKeyUp);
  }

  getShapeContextMenuColumns = () => {
    const groupContext = {
      name: '成组',
      key: 'group',
      underLine: true, // 是否有分割线
      onClick: e => {
        const { groupDisable } = this.state;
        if (!groupDisable) {
          const { onGroup } = this.props;
          const shapes = this.getElementsActived();
          onGroup(shapes);
        }
      },
    };

    const deleteContext = {
      name: '删除',
      key: 'delete',
      onClick: e => {
        this.onDelete();
      },
    };

    const { groupDisable } = this.state;

    const columns = [];
    if (groupDisable) {
      columns.push(deleteContext);
    } else {
      columns.push(groupContext);
      columns.push(deleteContext);
    }
    return columns;
  };

  getContainerContextMenuColumns = () => [
    // 自定义右键菜单的内容
    {
      name: '创建多边形',
      key: 'polygon',
      underLine: true, // 是否有分割线
      onClick: e => {
        this.addNewShape('polygon');
      },
    },
    {
      name: '创建线条',
      key: 'polyline',
      underLine: true, // 是否有分割线
      onClick: e => {
        this.addNewShape('polyline');
      },
    },
  ];

  getDeleteConfirm = () => {
    const { deleteConfirm } = this.props;

    const defaultDeleteConfirm = (
      <Modal
        title="删除"
        visible
        onOk={() => {
          this.setDeleteConfirmVisible(false);
          this.deleteShapesActived();
        }}
        onCancel={() => {
          this.setDeleteConfirmVisible(false);
        }}
        okText="确认"
        cancelText="取消"
      >
        确定删除吗？
      </Modal>
    );

    return deleteConfirm || defaultDeleteConfirm;
  };

  /**
   * 获取当前画布信息
   */
  getShapesData = () => {
    return this.state.shapesData;
  };

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

    const { readOnly } = this.props;

    let attr;

    switch (shape.shape_type) {
      case 'polygon': // 多边形
        attr = {
          stroke: '#1678E6',
          strokeWidth: 1,
          fill: '#044B9410',
          class: 'com-marking-shape',
          shape_id: shape.shape_id || uuid(),
        };

        if (readOnly) {
          this.snap.paper.polygon(points).attr(attr);
        } else {
          this.snap.paper
            .polygon(points)
            .attr(attr)
            .click(this.onElementClick)
            .dblclick(this.onElementDblClick)
            .drag(this.onDragMove, this.onDragStart, this.onDragEnd);
        }

        break;
      case 'polyline':
        attr = {
          stroke: '#1678E6',
          strokeWidth: 1,
          fill: '#044B9410',
          fillOpacity: 0,
          class: 'com-marking-shape',
          shape_id: shape.shape_id || uuid(),
        };

        if (readOnly) {
          this.snap.paper.polyline(points).attr(attr);
        } else {
          this.snap.paper
            .polyline(points)
            .attr(attr)
            .click(this.onElementClick)
            .dblclick(this.onElementDblClick)
            .drag(this.onDragMove, this.onDragStart, this.onDragEnd);
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
      this.highlightShape(shape.node);
    });

    return shapes;
  }

  /**
   * 高亮某个图形
   * @param {*} dom dom
   */
  highlightShape(dom) {
    dom.classList.add('active');

    this.setOperateBtnDisableState();
  }

  /**
   * 使用一个最小距离来判断图形是否在拖动
   * @param {*} dx x 轴位移
   * @param {*} dy y 轴位移
   */
  isDraging(dx, dy) {
    const MIN_DISTANCE = 5;
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
  onDragMove = (dx, dy, x, y, e) => {
    const { drawing } = this.state;

    if (drawing) {
      return false;
    }

    if (this.isDraging(dx, dy)) {
      const { draging } = this.state;

      if (!draging) {
        this.setState({
          draging: true,
        });
      }
    }

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
            shapesData,
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
    const { shapesData, drawing } = this.state;

    if (drawing) {
      return false;
    }

    const { target } = e;

    const element = Snap(target);
    const shapeId = element.node.getAttribute('shape_id');

    const position = getEventPosition(e);

    const currentShape = getItemFromArrayByKey(shapesData, 'shape_id', shapeId);

    // 当前拖拽的图形信息
    this.dragStartInfo = {
      shapeId,
      shape: currentShape,
      startX: position.x,
      startY: position.y,
      startPoints: JSON.parse(JSON.stringify(currentShape.points)),
    };
  };

  /**
   * drag end event
   * @param {*} x x 坐标
   * @param {*} y y 坐标
   * @param {*} e 事件
   */
  onDragEnd = e => {
    const { shapesData, drawing, draging } = this.state;

    if (drawing) {
      return false;
    }

    if (draging) {
      const { onShapeMove } = this.props;
      const { shape } = this.dragStartInfo;
      onShapeMove(shape);
      this.onShapesDataChange(shapesData);
    }

    this.setState({
      draging: false,
    });
  };

  // 结束绘制
  endDrawing = e => {
    this.setState({
      drawing: false,
    });

    const { shapesData } = this.state;
    this.onShapesDataChange(shapesData);
  };

  // 增加边线
  addEdge = e => {
    const position = getEventPosition(e);

    this.addPoint(position);
  };

  // 绘制连线
  drawLine = e => {
    const position = getEventPosition(e);

    const { drawing, shapesData } = this.state;

    if (drawing) {
      // const tempData = JSON.parse(JSON.stringify(shapesData));
      const tempData = shapesData;

      const length = tempData && tempData.length;

      if (length > 0) {
        tempData[length - 1].points.pop();
        tempData[length - 1].points.push([position.x, position.y]);

        this.drawShapes(tempData);
      }
    }
  };

  // 增加顶点
  addPoint = position => {
    const { shapesData, drawing } = this.state;
    const length = shapesData && shapesData.length;

    if (drawing && length) {
      shapesData[length - 1].points.push([position.x, position.y]);
      this.setState(
        {
          shapesData,
        },
        () => {
          this.drawShapes(shapesData);
        }
      );
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
    return this.snap ? this.snap.selectAll('.com-marking-shape.active') : [];
  };

  /**
   * 操作按钮点击
   * @param {string} shapeType 图形类型，polygon 或 polyline
   */
  onOperateBtnClick = shapeType => {
    switch (shapeType) {
      case 'group':
        const { onGroup } = this.props;
        const { groupDisable } = this.state;
        if (!groupDisable) {
          const shapes = this.getElementsActived();
          onGroup(shapes);
        }
        break;
      default:
        this.addNewShape(shapeType);
        break;
    }
  };

  /**
   * 新增新的图形
   * @param {string} shapeType 图形类型，polygon 或 polyline
   */
  addNewShape = shapeType => {
    const { shapesData } = this.state;

    shapesData.push({
      shape_type: shapeType,
      shape_id: uuid(),
      points: [],
    });

    this.setState({
      drawing: true,
      shapeType,
      shapesData,
    });
  };

  setOperateBtnDisableState() {
    const elementsActived = this.getElementsActived();

    const deleteDisable = elementsActived.length < 1;
    const groupDisable = elementsActived.length < 2;

    this.setState({
      deleteDisable,
      groupDisable,
    });
  }

  deleteShapesActived() {
    let { shapesData } = this.state;
    const elements = this.snap.selectAll('.com-marking-shape.active');

    elements &&
      elements.forEach(ele => {
        Snap(ele).remove();
        const shapeId = ele.node.getAttribute('shape_id');
        shapesData = removeItemFromArrayByKey(shapesData, 'shape_id', shapeId);
      });

    this.setState(
      {
        shapesData,
      },
      () => {
        const { onShapesDelete } = this.props;
        this.setOperateBtnDisableState();
        onShapesDelete(elements);
        this.onShapesDataChange(shapesData);
      }
    );
  }

  setDeleteConfirmVisible = visible => {
    this.setState({
      isDeleteConfirmVisible: visible,
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
          class: 'com-marking-shape',
        });
      });

    this.setOperateBtnDisableState();
  };

  // 图形点击事件
  onElementClick = e => {
    const { isShiftKeyDown, drawing } = this.state;

    if (!drawing) {
      e.stopPropagation();

      if (!isShiftKeyDown) {
        this.clearElementActive();
      }

      const { target } = e;
      const element = Snap(target);

      this.highlightShape(element.node);

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
      const { target } = e;
      const element = Snap(target);

      element.attr({
        class: 'com-marking-shape active',
      });

      const { onShapeDblClick } = this.props;
      onShapeDblClick(element);
    }
  };

  // SVG 点击事件
  onSvgClick = e => {
    clearTimeout(this.clickTimer);

    // 通过延迟执行单击逻辑，来解决单双击事件逻辑相互干扰问题
    this.clickTimer = setTimeout(() => {
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
    clearTimeout(this.clickTimer);

    const { drawing } = this.state;

    if (drawing) {
      this.endDrawing(e);
    }

    const { onContainerDblClick } = this.props;
    onContainerDblClick(e);
  };

  // 元素删除事件
  onDelete = () => {
    const { deleteDisable } = this.state;

    if (deleteDisable) {
      return false;
    }

    const { isDeleteConfirmOpen } = this.props;

    if (isDeleteConfirmOpen) {
      this.setDeleteConfirmVisible(true);
    } else {
      this.deleteShapesActived();
    }
  };

  // 键盘事件监听
  onKeyDownListener = () => {
    window.addEventListener('keydown', this.onShiftKeyDown);
    window.addEventListener('keyup', this.onShiftKeyUp);
  };

  // shift按键按下键盘事件监听
  onShiftKeyDown = e => {
    // 按下 shift 键
    if (e.keyCode === 16) {
      this.setState({
        isShiftKeyDown: true,
      });
    }
  };

  // shift按键抬起键盘事件监听
  onShiftKeyUp = e => {
    // 按下 shift 键
    if (e.keyCode === 16) {
      this.setState({
        isShiftKeyDown: false,
      });
    }
  };

  /**
   * 右键事件被触发
   */
  onContextMenuTargetRightClick = target => {
    let columns;
    if (target.classList.contains('com-marking-shape')) {
      columns = this.getShapeContextMenuColumns();
    } else if (target.classList.contains('com-image-marking-container')) {
      columns = this.getContainerContextMenuColumns();
    }

    this.highlightShape(target);

    this.setState({
      contextMenuColumns: columns,
    });
  };

  onShapesDataChange(shapesData) {
    const { onChange } = this.props;
    const data = this.handleShapesData(shapesData);
    onChange(data);
  }

  // 过滤掉顶点数小于2个的图形
  handleShapesData(shapesData) {
    return shapesData.filter(item => {
      const points = this.uniqueShapePoints(item.points);
      if (points.length < 2) {
        return false;
      }
      return true;
    });
  }

  uniqueShapePoints(shapesData) {
    const arr1 = shapesData.map(item => item.join(','));
    const arr2 = Array.from(new Set(arr1));
    const result = arr2.map(item => item.split(','));
    return result;
  }

  render() {
    const { className } = this.props;
    const {
      contextMenuColumns,
      deleteDisable,
      groupDisable,
      isDeleteConfirmVisible,
    } = this.state;

    return (
      <div className={`com-image-marking-container ${className}`}>
        <div className="operate-bar">
          &emsp;
          <i
            className="iconfont-image-marking icon-duobianxing1 operation-btn"
            onClick={() => this.onOperateBtnClick('polygon')}
          />
          &ensp;
          <i
            className="iconfont-image-marking icon-xianduan operation-btn"
            onClick={() => this.onOperateBtnClick('polyline')}
          />
          &ensp;
          <i
            className={`iconfont-image-marking icon-xingzhuangjiehe operation-btn ${
              groupDisable ? 'disabled' : ''
            }`}
            onClick={() => this.onOperateBtnClick('group')}
          />
          &ensp;
          <i
            className={`iconfont-image-marking icon-shanchu operation-btn ${
              deleteDisable ? 'disabled' : ''
            }`}
            onClick={() => this.onDelete()}
          />
        </div>
        <svg className="com-image-marking-svg" />
        <ContextMenu
          actionScopeClassName="com-marking-shape,com-image-marking-container" // 右键时出现自定义菜单的区域的类名 class
          columns={contextMenuColumns} // 右键菜单的内容
          onTargetRightClick={this.onContextMenuTargetRightClick}
        />
        {isDeleteConfirmVisible ? this.getDeleteConfirm() : null}
      </div>
    );
  }
}

export default ImageMarking;
