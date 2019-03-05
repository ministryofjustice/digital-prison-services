import {
  bulkAppointmentGaEvent,
  NumberOfAppointmentsEvent,
  AppointmentTypeUsed,
  RecordWhenTheStartTimesHaveBeenAmended,
} from './BulkAppointmentsGaEvents'

describe('Bulk appointment ga events', () => {
  it('should create an ga event of number of appointments created', () => {
    const agencyId = 'LEI'
    const total = 2

    expect(NumberOfAppointmentsEvent({ total, agencyId })).toEqual({
      ...bulkAppointmentGaEvent,
      action: `bulk appointments created for ${agencyId}`,
      value: total,
    })
  })

  it('should create an ga event to record appointment type used in bulk appointments batch', () => {
    const total = 2
    const appointmentType = 'ACC'

    expect(AppointmentTypeUsed({ total, appointmentType })).toEqual({
      ...bulkAppointmentGaEvent,
      action: `appointment type ${appointmentType}`,
      value: total,
    })
  })

  it('should return an ga event recording when the start time has been amended validating the need for a better start time picker ', () => {
    const appointmentsDefaults = {
      startTime: '2019-10-10T21:00',
    }
    const appointments = [
      { bookingId: 1, startTime: '2019-10-10T30:00' },
      { bookingId: 2, startTime: '2019-10-10T40:00' },
    ]

    expect(RecordWhenTheStartTimesHaveBeenAmended({ appointmentsDefaults, appointments })).toEqual({
      ...bulkAppointmentGaEvent,
      action: `start time has been amended`,
      value: 2,
    })

    expect(
      RecordWhenTheStartTimesHaveBeenAmended({
        appointmentsDefaults,
        appointments: [{ bookingId: 1 }, { bookingId: 2 }],
      })
    ).toEqual(null)
  })
})
