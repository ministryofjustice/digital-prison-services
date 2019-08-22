import React from 'react'
import { shallow } from 'enzyme/build'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { notify } from 'react-notify-toast'
import { CreateAlertContainer } from './CreateAlertContainer'

const axiosMock = new MockAdapter(axios)

const apiCalls = {
  getAlertTypes: '/api/get-alert-types',
  createAlert: '/api/create-alert/1',
}

const defaultProps = {
  offenderNo: 'A12345',
  offenderDetails: {
    bookingId: 1,
    firstName: 'John',
    lastName: 'Doe',
  },
  alertTypes: [],
  alertSubTypes: [],
  resetErrorDispatch: () => {},
  setLoadedDispatch: () => {},
  handleError: () => {},
  createAlertHandler: () => {},
  raiseAnalyticsEvent: () => {},
  history: {
    replace: () => {},
    goBack: () => {},
  },
}

const alerts = {
  alertTypes: [{ title: 'alert 1', value: 'alert-type-1' }],
  alertSubTypes: [{ title: 'alert sub 1', value: 'alert-sub-1', parentValue: 'alert-type-1' }],
}

const findGetRequests = url => axiosMock.history.get.find(request => request.url === url)

describe('Create Alert container', () => {
  beforeEach(() => {
    axiosMock.reset()
    axiosMock.onGet(apiCalls.getAlertTypes).reply(200, alerts)
    notify.show = jest.fn()
  })

  describe('Initial load', () => {
    it('should request alert types and sub types', async () => {
      const wrapper = shallow(<CreateAlertContainer {...defaultProps} />)
      const instance = wrapper.instance()

      await instance.componentDidMount()

      const matching = findGetRequests(apiCalls.getAlertTypes)
      expect(matching).toBeDefined()
    })

    it('should update the state with new alert types and sub types', async () => {
      const wrapper = shallow(<CreateAlertContainer {...defaultProps} />)
      const instance = wrapper.instance()

      await instance.componentDidMount()

      expect(wrapper.state()).toEqual(alerts)
    })

    it('should pass the correct props to the CreateForm component', async () => {
      const tree = shallow(<CreateAlertContainer {...defaultProps} {...alerts} />)

      expect(tree).toMatchSnapshot()
    })
  })

  describe('Creating an alert', () => {
    it('should create new alert', async () => {
      axiosMock.onPost(apiCalls.createAlert).reply(201)

      const wrapper = shallow(<CreateAlertContainer {...defaultProps} {...alerts} />)
      const instance = wrapper.instance()
      await instance.createAlertHandler({
        alertType: 'P',
        comment: 'sdf',
        alertSubType: 'PL1',
        effectiveDate: '2019-10-10',
      })

      const postRequest = axiosMock.history.post[0]

      expect(postRequest.url).toBe(apiCalls.createAlert)
      expect(JSON.parse(postRequest.data)).toEqual({
        alertType: 'P',
        comment: 'sdf',
        alertSubType: 'PL1',
        effectiveDate: '2019-10-10',
      })
    })

    it('should handle error from failed create alert attempt', async () => {
      axiosMock.onPost(apiCalls.createAlert).reply(500)

      const handleError = jest.fn()

      const wrapper = shallow(<CreateAlertContainer {...defaultProps} handleError={handleError} />)
      const instance = wrapper.instance()
      await instance.createAlertHandler({ alertType: 'P', comment: 'sdf', alertSubType: 'PL1' })

      expect(notify.show.mock.calls.length).toBe(0)
      expect(handleError).toHaveBeenCalledWith(new Error('Request failed with status code 500'))
    })

    it('should show success notification and redirect back to previous page on create alert', async () => {
      axiosMock.onPost(apiCalls.createAlert).reply(201)
      const history = {
        goBack: jest.fn(),
        replace: () => {},
      }

      const wrapper = shallow(<CreateAlertContainer {...defaultProps} {...alerts} history={history} />)
      const instance = wrapper.instance()
      await instance.createAlertHandler({ alertType: 'P', comment: 'sdf', alertSubType: 'PL1' })

      expect(notify.show).toHaveBeenCalledWith('Alert has been created', 'success')
      expect(history.goBack).toHaveBeenCalled()
    })

    it('should raise analytics event', async () => {
      axiosMock.onPost(apiCalls.createAlert).reply(201)
      const raiseAnalyticsEvent = jest.fn()

      const wrapper = shallow(
        <CreateAlertContainer {...defaultProps} {...alerts} raiseAnalyticsEvent={raiseAnalyticsEvent} />
      )
      const instance = wrapper.instance()
      await instance.createAlertHandler({
        alertType: 'P',
        comment: 'sdf',
        alertSubType: 'PL1',
        effectiveDate: '2019-10-10',
      })

      expect(raiseAnalyticsEvent).toHaveBeenCalledWith({
        category: 'alert created',
        label: 'Alerts',
        value: { alertType: 'P', comment: 'sdf', alertSubType: 'PL1', effectiveDate: '2019-10-10' },
      })
    })

    it('should reset errors before creating a new alert', async () => {
      axiosMock.onPost(apiCalls.createAlert).reply(201)
      const resetErrorDispatch = jest.fn()

      const wrapper = shallow(
        <CreateAlertContainer {...defaultProps} {...alerts} resetErrorDispatch={resetErrorDispatch} />
      )
      const instance = wrapper.instance()
      await instance.createAlertHandler({ alertType: 'P', comment: 'sdf', alertSubType: 'PL1' })

      expect(resetErrorDispatch).toHaveBeenCalled()
    })

    it('should navigate back to the previous location on cancel', async () => {
      const history = {
        goBack: jest.fn(),
        replace: () => {},
      }
      const wrapper = shallow(<CreateAlertContainer {...defaultProps} {...alerts} history={history} />)
      const instance = wrapper.instance()

      instance.cancel()

      expect(history.goBack).toHaveBeenCalled()
    })
  })
})
