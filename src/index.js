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
  applyMiddleware(logger)
);

ReactDOM.render(
  <Provider store={store}>
    <AppContainer/>
  </Provider>,
  document.getElementById('root')
);
