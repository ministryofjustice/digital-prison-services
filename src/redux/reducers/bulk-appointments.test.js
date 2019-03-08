import reducer from './bulk-appointments'
import * as Actions from '../actions'

describe('Bulk appointments reducer', () => {
  const initialState = {
    appointmentDetails: {},
    prisoners: [],
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('should handle SET_BULK_APPOINTMENT_DETAILS', () => {
    const state = reducer(
      initialState,
      Actions.setAppointmentDetails({
        appointmentTypes: [{ id: 'ACT', description: 'Activities' }],
        locationTypes: [{ id: 1, description: 'Adj' }],
        appointmentType: 'ACT',
        location: 1,
        startTime: '2019-10-10T21:00:00Z',
        endTime: '2019-10-10T22:00:00Z',
        comments: 'hello, world',
      })
    )

    expect(state).toEqual({
      ...initialState,
      appointmentDetails: {
        appointmentType: 'ACT',
        appointmentTypeDescription: 'Activities',
        location: 1,
        locationDescription: 'Adj',
        startTime: '2019-10-10T21:00:00Z',
        endTime: '2019-10-10T22:00:00Z',
        comments: 'hello, world',
      },
    })
  })

  it('should handle SET_BULK_APPOINTMENT_PRISONERS', () => {
    const prisoners = [{ bookingId: 1, firstName: 'firstName1', lastName: 'lastName1' }]
    const state = reducer(initialState, Actions.setAppointmentPrisoners(prisoners))

    expect(state).toEqual({
      ...initialState,
      prisoners,
    })
  })

  it('should handle SET_BULK_APPOINTMENTS_COMPLETE', () => {
    const prisoners = [{ bookingId: 1, firstName: 'firstName1', lastName: 'lastName1' }]
    const appointmentDetails = {
      appointmentType: 'ACT',
      appointmentTypeDescription: 'Activities',
      location: 1,
      locationDescription: 'Adj',
      startTime: '2019-10-10T21:00:00Z',
      endTime: '2019-10-10T22:00:00Z',
      comments: 'hello, world',
    }
    const currentState = {
      appointmentDetails,
      prisoners,
    }
    const state = reducer(currentState, Actions.setBulkAppointmentsComplete())

    expect(state).toEqual({
      ...initialState,
    })
  })
})
