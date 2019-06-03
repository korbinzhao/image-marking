'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./my-component.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import './my-component.css';

var MyComponent = function MyComponent() {
  return _react2.default.createElement(
    'div',
    { className: 'container' },
    _react2.default.createElement(
      'div',
      { className: 'content' },
      _react2.default.createElement(
        'p',
        null,
        'React here!!!'
      )
    )
  );
};

// 可自行选用 less 或 styl 来编写样式
exports.default = MyComponent;