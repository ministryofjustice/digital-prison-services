import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { AppContainer } from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import allocationApp from './redux/reducers';

// Logger with default options
import logger from 'redux-logger';
const store = createStore(
  allocationApp,
  applyMiddleware(logger),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <Provider store={store}>
    <AppContainer/>
  </Provider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
