import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'

import './index.scss'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'
import { ConnectedFlagsProvider } from './flags'
import allocationApp from './redux/reducers'

// Logger with default options
import { AppContainer } from './App'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(allocationApp, composeEnhancers(applyMiddleware(thunkMiddleware, logger)))

ReactDOM.render(
  <Provider store={store}>
    <ConnectedFlagsProvider store={store}>
      <AppContainer />
    </ConnectedFlagsProvider>
  </Provider>,
  document.getElementById('root')
)

if (module.hot) {
  module.hot.accept()
}
