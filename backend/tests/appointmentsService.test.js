const { appointmentsServiceFactory } = require('../services/appointmentsService')

describe('Appointments service', () => {
  const elite2Api = {}
  const context = {}
  const agency = 'LEI'
  const appointmentTypes = [{ code: 'ACTI', description: 'Activities' }]
  const locationTypes = [
    {
      locationId: 27187,
      locationType: 'ADJU',
      description: 'RES-MCASU-MCASU',
      agencyId: 'MDI',
      parentLocationId: 27186,
      currentOccupancy: 0,
      locationPrefix: 'MDI-RES-MCASU-MCASU',
      userDescription: 'Adj',
    },
    {
      locationId: 27188,
      locationType: 'ADJU',
      description: 'RES-MCASU-MCASU',
      agencyId: 'MDI',
      parentLocationId: 27186,
      currentOccupancy: 0,
      locationPrefix: 'MDI-RES-MCASU-MCASU',
    },
  ]

  let service

  beforeEach(() => {
    elite2Api.getLocationsForAppointments = jest.fn()
    elite2Api.getAppointmentTypes = jest.fn()
    elite2Api.addAppointments = jest.fn()

    service = appointmentsServiceFactory(elite2Api)
  })

  it('should make a request for appointment locations and types', async () => {
    await service.getAppointmentOptions(context, agency)

    expect(elite2Api.getLocationsForAppointments).toHaveBeenCalledWith(context, agency)
    expect(elite2Api.getAppointmentTypes).toHaveBeenCalledWith(context)
  })

  it('should handle empty responses from appointment types and locations', async () => {
    const response = await service.getAppointmentOptions(context, agency)

    expect(response).toEqual({})
  })

  it('should map appointment types and locations correctly', async () => {
    elite2Api.getLocationsForAppointments.mockReturnValue(locationTypes)
    elite2Api.getAppointmentTypes.mockReturnValue(appointmentTypes)

    const response = await service.getAppointmentOptions(context, agency)

    expect(response).toEqual({
      appointmentTypes: [{ value: 'ACTI', text: 'Activities' }],
      locationTypes: [{ value: 27187, text: 'Adj' }, { value: 27188, text: 'RES-MCASU-MCASU' }],
    })
  })

  it('should make a bulk appointments request with the correct parameters', async () => {
    const parameters = {
      appointmentDefaults: {
        appointmentType: 'ACTI',
        locationId: 25,
        startTime: '2018-12-31T14:00',
        endTime: '2018-12-31T14:50:00',
        comment:
          'Please provide helpful supporting text when it applies to all the appointments specified by this request.',
      },
      appointments: [
        {
          bookingId: 123456,
          startTime: '2018-12-31T23:50',
          endTime: '2018-12-31T23:59',
          comment:
            'Please provide helpful supporting text relevant to this particular appointment when the default comment is not suitable.',
        },
      ],
    }

    await service.addAppointments(context, parameters)

    expect(elite2Api.addAppointments).toHaveBeenCalledWith(context, parameters)
  })
})
