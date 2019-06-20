import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './demo';

import './index.less';

const App = () => {
  return (
    <Demo />
  );
};

// export default App;

ReactDOM.render(<App />, document.getElementById('app'));
