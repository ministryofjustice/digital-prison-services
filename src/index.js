import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { AppContainer } from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import allocationApp from './redux/reducers';

// Logger with default options
import logger from 'redux-logger';
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(allocationApp, composeEnhancers(applyMiddleware(logger)));

ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
