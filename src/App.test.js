import 'babel-jest'
import React from 'react'
import ReactDOM from 'react-dom'
import { shallow } from 'enzyme'
import App from './App'

jest.mock('./Spinner/index', () => '')

const store = {
  getState: () => {},
  subscribe: () => {},
  dispatch: () => {},
}
const fn = jest.fn()
const props = {
  configDispatch: fn,
  userDetailsDispatch: fn,
  switchAgencyDispatch: fn,
  setTermsVisibilityDispatch: fn,
  setErrorDispatch: fn,
  setMessageDispatch: fn,
  locationDispatch: fn,
  activitiesDispatch: fn,
  activityDispatch: fn,
  dateDispatch: fn,
  periodDispatch: fn,
  houseblockDataDispatch: fn,
  activityDataDispatch: fn,
  setLoadedDispatch: fn,
  orderDispatch: fn,
  sortOrderDispatch: fn,
  boundSetMenuOpen: fn,
  showModal: {},
  setCaseChangeRedirectStatusDispatch: fn,
}
const component = shallow(<App {...props} />)

describe('App component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    // Just provide dummy required prop functions
    ReactDOM.render(<App {...props} store={store} />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('should handle session timeout error response and display alert', async () => {
    const appInstance = component.instance()
    appInstance.displayAlertAndLogout = jest.fn()
    appInstance.handleError({
      response: { status: 401, data: { message: 'Session expired', reason: 'session-expired' } },
    })
    expect(component.instance().displayAlertAndLogout).toBeCalledWith(
      'Your session has expired, please click OK to be redirected back to the login page'
    )

    appInstance.displayAlertAndLogout = jest.fn()
    appInstance.handleError({ response: { status: 401, data: { message: 'another 401' } } })
    expect(component.instance().displayAlertAndLogout).not.toBeCalled()

    appInstance.displayAlertAndLogout = jest.fn()
    appInstance.handleError({ response: { status: 400 } })
    expect(component.instance().displayAlertAndLogout).not.toBeCalled()

    appInstance.displayAlertAndLogout = jest.fn()
    appInstance.handleError({})
    expect(component.instance().displayAlertAndLogout).not.toBeCalled()
  })

  it('should handle non-session timout error responses without the session timeout alert', async () => {
    const appInstance = component.instance()
    appInstance.displayAlertAndLogout = jest.fn()
    appInstance.handleError({ response: { status: 401, data: { message: 'another 401' } } })
    expect(component.instance().displayAlertAndLogout).not.toBeCalled()

    appInstance.displayAlertAndLogout = jest.fn()
    appInstance.handleError({ response: { status: 400 } })
    expect(component.instance().displayAlertAndLogout).not.toBeCalled()

    appInstance.displayAlertAndLogout = jest.fn()
    appInstance.handleError({})
    expect(component.instance().displayAlertAndLogout).not.toBeCalled()
  })

  it('should close the menu when the content is clicked', () => {
    component.find('.inner-content').simulate('click')
    expect(props.boundSetMenuOpen).toHaveBeenCalledWith(false)
  })
})
