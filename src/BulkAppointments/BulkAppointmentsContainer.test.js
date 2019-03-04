import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'

import BulkAppointmentsContainer from './BulkAppointmentsContainer'

import {
  NumberOfAppointmentsEvent,
  AppointmentTypeUsed,
  RecordWhenTheStartTimesHaveBeenAmended,
} from './BulkAppointmentsGaEvents'

describe('Bulk appointments container', () => {
  const now = moment('2019-10-10T:21:00:00Z', 'YYYY-MM-DDTHH:mm:ss')
  const store = {
    getState: jest.fn(),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
  }
  beforeEach(() => {
    store.getState.mockReturnValue({
      app: {
        user: {
          activeCaseLoadId: 'LEI',
        },
        config: {
          notmEndpointUrl: '/',
        },
      },
    })
  })
  const appointment = {
    appointmentType: 'ACC',
    locationId: 1,
    startTime: '2019-10-10T21:00:00Z',
    date: '2019-10-10',
  }
  it('should render default step', () => {
    const wrapper = shallow(
      <BulkAppointmentsContainer now={now} store={store} handleError={() => {}} raiseAnalyticsEvent={() => {}} />
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('should render offender step', () => {
    const wrapper = shallow(
      <BulkAppointmentsContainer now={now} store={store} handleError={() => {}} raiseAnalyticsEvent={() => {}} />
    )

    const component = wrapper.dive()

    component.instance().setAppointmentDetails({ appointment })
    expect(component).toMatchSnapshot()
  })

  it('should render completed step', () => {
    const wrapper = shallow(
      <BulkAppointmentsContainer now={now} store={store} handleError={() => {}} raiseAnalyticsEvent={() => {}} />
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
      <BulkAppointmentsContainer
        now={now}
        store={store}
        handleError={() => {}}
        raiseAnalyticsEvent={raiseAnalyticsEvent}
      />
    )

    const component = wrapper.dive()
    component.instance().setAppointmentDetails({ appointment })

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
