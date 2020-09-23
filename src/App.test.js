import 'babel-jest'
import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import { shallow, mount } from 'enzyme'
import { FooterContainer } from 'new-nomis-shared-components'
import App from './App'

jest.mock('./Spinner/index', () => '')

const store = {
  getState: () => ({
    app: { showModal: {} },
    content: {
      links: {
        Meta: [
          {
            fields: {
              title: 'Terms and Conditions',
              path: 'terms-conditions',
            },
          },
        ],
        Footer: [
          {
            fields: {
              title: 'Features',
              path: 'features',
            },
          },
          {
            fields: {
              title: "What's new",
              path: 'whats-new',
            },
          },
        ],
      },
    },
  }),
  subscribe: () => {},
  dispatch: () => {},
}
const fn = jest.fn()
const props = {
  activity: '',
  caseChangeRedirect: true,
  config: { notmEndpointUrl: '', mailTo: 'feedback@test.com', supportUrl: '//supportUrl/' },
  currentLocation: 'cell',
  date: 'today',
  menuOpen: false,
  title: 'Application Title',
  orderField: 'cellLocation',
  period: '1',
  shouldShowTerms: true,
  sortOrder: 'ASC',
  modalActive: false,
  user: { roles: [] },
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
  setErrorDispatch: fn,
  resetErrorDispatch: fn,
  setLoadedDispatch: fn,
  setMessageDispatch: fn,
  setTermsVisibilityDispatch: fn,
  sortOrderDispatch: fn,
  userDetailsDispatch: fn,
  fetchContentLinksDispatch: fn,
  setFlagsDispatch: fn,
  setShowModalDispatch: fn,
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

    describe('should handle session timeout error response', () => {
      const appInstance = component.instance()

      beforeEach(() => {
        appInstance.displayAlertAndLogout = jest.fn()
        window.scrollTo = jest.fn()
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
        expect(window.scrollTo).toHaveBeenCalled()
      })
    })
  })

  it('should pass through correct props to the footer container', () => {
    const component = mount(<App {...props} store={store} />)

    expect(component.find(FooterContainer).props()).toEqual({
      supportUrl: `${props.config.supportUrl}feedback-and-support`,
      prisonStaffHubUrl: '/',
    })
  })
})
