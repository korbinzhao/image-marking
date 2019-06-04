import React, { Component } from "react";
import ReactDOM from "react-dom";
import ImageMarking from '../src/index';
import MARKING_DATA from './data';

import './index.less';

const App = () => {
  return (
    <div className="demo-container">
      <img className="demo-image" src="https://img.alicdn.com/tfs/TB1ICO3bA5E3KVjSZFCXXbuzXXa-800-533.png" />
      <ImageMarking className="custom-classname" dataSource={MARKING_DATA.shapes} />
    </div>
  );
};

// export default App;

ReactDOM.render(<App />, document.getElementById("app"));
