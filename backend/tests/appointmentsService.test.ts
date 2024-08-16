import { appointmentsServiceFactory } from '../services/appointmentsService'

describe('Appointments service', () => {
  const prisonApi = {}
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocationsForAppointments' does not ex... Remove this comment to see the full error message
    prisonApi.getLocationsForAppointments = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentTypes' does not exist on t... Remove this comment to see the full error message
    prisonApi.getAppointmentTypes = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
    prisonApi.addAppointments = jest.fn()

    service = appointmentsServiceFactory(prisonApi)
  })

  it('should make a request for appointment locations and types', async () => {
    await service.getAppointmentOptions(context, agency)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocationsForAppointments' does not ex... Remove this comment to see the full error message
    expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(context, agency)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentTypes' does not exist on t... Remove this comment to see the full error message
    expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(context)
  })

  it('should handle empty responses from appointment types and locations', async () => {
    const response = await service.getAppointmentOptions(context, agency)

    expect(response).toEqual({})
  })

  it('should map appointment types and locations correctly', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocationsForAppointments' does not ex... Remove this comment to see the full error message
    prisonApi.getLocationsForAppointments.mockReturnValue(locationTypes)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentTypes' does not exist on t... Remove this comment to see the full error message
    prisonApi.getAppointmentTypes.mockReturnValue(appointmentTypes)

    const response = await service.getAppointmentOptions(context, agency)

    expect(response).toEqual({
      appointmentTypes: [{ value: 'ACTI', text: 'Activities' }],
      locationTypes: [
        { value: 27187, text: 'Adj' },
        { value: 27188, text: 'RES-MCASU-MCASU' },
      ],
    })
  })
})
