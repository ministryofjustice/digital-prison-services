import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'

import AddPrisonersContainer from './AddPrisonersContainer'

import {
  NumberOfAppointmentsEvent,
  AppointmentTypeUsed,
  RecordWhenTheStartTimesHaveBeenAmended,
} from '../BulkAppointmentsGaEvents'

const initialState = {
  app: {
    user: {
      activeCaseLoadId: 'LEI',
    },
    config: {
      notmEndpointUrl: '/',
    },
  },
  bulkAppointments: {
    appointmentDetails: {
      appointmentType: 'ACC',
      locationId: 1,
      appointmentTypeDescription: 'Activities',
      locationDescription: 'Gym',
      startTime: '2019-10-10T:21:00:00Z',
      comments: 'test comment',
      times: '1',
      recurring: true,
      repeats: 'DAILY',
      counts: '2',
    },
    offenders: [{ bookingId: 1 }, { bookingId: 2 }],
  },
}

describe('Add prisoners container', () => {
  const now = moment('2019-10-10T21:00:00Z')
  const store = {}
  const history = {}
  beforeEach(() => {
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    history.push = jest.fn()
    history.replace = jest.fn()
    store.getState.mockReturnValue(initialState)
  })
  const appointment = {
    appointmentType: 'ACC',
    locationId: 1,
    startTime: '2019-10-10T21:00:00Z',
    date: '2019-10-10',
  }

  it('should pass props correctly', () => {
    const wrapper = shallow(
      <AddPrisonersContainer
        now={now}
        store={store}
        handleError={() => {}}
        raiseAnalyticsEvent={() => {}}
        history={history}
      />
    )

    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('should render completed view', () => {
    store.getState.mockReturnValue({
      ...initialState,
      bulkAppointments: {
        appointmentDetails: {
          ...initialState.bulkAppointments.appointmentDetails,
          recurring: false,
        },
      },
    })
    const wrapper = shallow(
      <AddPrisonersContainer
        now={now}
        store={store}
        handleError={() => {}}
        raiseAnalyticsEvent={() => {}}
        history={history}
      />
    )

    const component = wrapper.dive()

    component.instance().onBulkAppointmentsCreated({
      appointments: [
        { bookingId: 1, startTime: '2019-01-01T00:00:00Z' },
        { bookingId: 2, startTime: '2019-01-01T00:00:00Z' },
      ],
    })
    expect(component).toMatchSnapshot()
  })

  it('should render completed view for recurring', () => {
    const wrapper = shallow(
      <AddPrisonersContainer
        now={now}
        store={store}
        handleError={() => {}}
        raiseAnalyticsEvent={() => {}}
        history={history}
      />
    )

    const component = wrapper.dive()

    component.instance().onBulkAppointmentsCreated({
      appointments: [
        { bookingId: 1, startTime: '2019-01-01T00:00:00Z' },
        { bookingId: 2, startTime: '2019-01-01T00:00:00Z' },
      ],
    })
    expect(component).toMatchSnapshot()
  })

  it('should call raiseAnalyticsEvent with three different events', () => {
    const raiseAnalyticsEvent = jest.fn()
    const wrapper = shallow(
      <AddPrisonersContainer
        now={now}
        store={store}
        handleError={() => {}}
        raiseAnalyticsEvent={raiseAnalyticsEvent}
        history={history}
      />
    )

    const component = wrapper.dive()

    const appointments = [
      { bookingId: 1, startTime: '2019-01-01T00:00:00Z' },
      { bookingId: 2, startTime: '2019-01-01T00:00:00Z' },
    ]
    component.instance().onBulkAppointmentsCreated({
      appointments,
    })

    expect(raiseAnalyticsEvent.mock.calls[0][0]).toEqual(
      NumberOfAppointmentsEvent({ total: appointments.length, agencyId: 'LEI' })
    )

    expect(raiseAnalyticsEvent.mock.calls[1][0]).toEqual(
      AppointmentTypeUsed({
        total: appointments.length,
        appointmentType: appointment.appointmentType,
      })
    )

    expect(raiseAnalyticsEvent.mock.calls[2][0]).toEqual(
      RecordWhenTheStartTimesHaveBeenAmended({
        appointmentsDefaults: appointment,
        appointments,
      })
    )
  })
})
