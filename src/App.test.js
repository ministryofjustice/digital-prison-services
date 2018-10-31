import 'babel-jest'
import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import { shallow } from 'enzyme'
import App from './App'

jest.mock('./Spinner/index', () => '')

const store = {
  getState: () => ({
    app: { showModal: {} },
  }),
  subscribe: () => {},
  dispatch: () => {},
}
const fn = jest.fn()
const props = {
  activity: '',
  caseChangeRedirect: true,
  config: {},
  currentLocation: 'cell',
  date: 'today',
  menuOpen: false,
  orderField: 'cellLocation',
  period: '1',
  shouldShowTerms: true,
  sortOrder: 'ASC',

  activitiesDispatch: fn,
  activityDataDispatch: fn,
  activityDispatch: fn,
  boundSetMenuOpen: fn,
  configDispatch: fn,
  dateDispatch: fn,
  houseblockDataDispatch: fn,
  locationDispatch: fn,
  orderDispatch: fn,
  periodDispatch: fn,
  setCaseChangeRedirectStatusDispatch: fn,
  setErrorDispatch: fn,
  resetErrorDispatch: fn,
  setLoadedDispatch: fn,
  setMessageDispatch: fn,
  setTermsVisibilityDispatch: fn,
  sortOrderDispatch: fn,
  switchAgencyDispatch: fn,
  userDetailsDispatch: fn,
}

describe('App component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    // Just provide dummy required prop functions
    ReactDOM.render(
      <Provider store={store}>
        <App {...props} />
      </Provider>,
      div
    )
    ReactDOM.unmountComponentAtNode(div)
  })

  describe('session timeouts', () => {
    const component = shallow(<App {...props} store={store} />)

    describe('should handle session timeout error response', async () => {
      const appInstance = component.instance()

      beforeEach(() => {
        appInstance.displayAlertAndLogout = jest.fn()
      })

      it('should display alert', () => {
        appInstance.handleError({
          response: { status: 401, data: { message: 'Session expired', reason: 'session-expired' } },
        })
        expect(appInstance.displayAlertAndLogout).toBeCalledWith(
          'Your session has expired, please click OK to be redirected back to the login page'
        )
      })

      it('should not display alert if unauthorised', () => {
        appInstance.handleError({ response: { status: 401, data: { message: 'another 401' } } })
        expect(appInstance.displayAlertAndLogout).not.toBeCalled()
      })

      it('should not display alert if bad request', () => {
        appInstance.handleError({ response: { status: 400 } })
        expect(appInstance.displayAlertAndLogout).not.toBeCalled()
      })

      it('should not display alert if unknown error', () => {
        appInstance.handleError({})
        expect(appInstance.displayAlertAndLogout).not.toBeCalled()
      })
    })
  })
})
