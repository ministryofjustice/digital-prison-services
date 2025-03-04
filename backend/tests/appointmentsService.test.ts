import { appointmentsServiceFactory } from '../services/appointmentsService'
import { prisonApiFactory } from '../api/prisonApi'
import { locationsInsidePrisonApiFactory, NonResidentialUsageType } from '../api/locationsInsidePrisonApi'

describe('Appointments service', () => {
  const prisonApi: Partial<ReturnType<typeof prisonApiFactory>> = {}
  const locationsInsidePrisonApi: Partial<ReturnType<typeof locationsInsidePrisonApiFactory>> = {}
  const context = {}
  const agency = 'LEI'
  const appointmentTypes = [{ code: 'ACTI', description: 'Activities' }]
  const locationTypes = [
    {
      id: 27187,
      locationType: 'ADJU',
      pathHierarchy: 'RES-MCASU-MCASU',
      prisonId: 'MDI',
      parentId: 27186,
      key: 'MDI-RES-MCASU-MCASU',
      localName: 'Adj',
    },
    {
      id: 27188,
      locationType: 'ADJU',
      pathHierarchy: 'RES-MCASU-MCASU',
      prisonId: 'MDI',
      parentId: 27186,
      key: 'MDI-RES-MCASU-MCASU',
    },
  ]

  let service

  beforeEach(() => {
    locationsInsidePrisonApi.getLocations = jest.fn()
    prisonApi.getAppointmentTypes = jest.fn()
    prisonApi.addAppointments = jest.fn()

    service = appointmentsServiceFactory(
      prisonApi as ReturnType<typeof prisonApiFactory>,
      locationsInsidePrisonApi as ReturnType<typeof locationsInsidePrisonApiFactory>
    )
  })

  it('should make a request for appointment locations and types', async () => {
    await service.getAppointmentOptions(context, agency)

    expect(locationsInsidePrisonApi.getLocations).toHaveBeenCalledWith(agency, NonResidentialUsageType.APPOINTMENT)
    expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(context)
  })

  it('should handle empty responses from appointment types and locations', async () => {
    const response = await service.getAppointmentOptions(context, agency)

    expect(response).toEqual({})
  })

  it('should map appointment types and locations correctly', async () => {
    ;(locationsInsidePrisonApi.getLocations as jest.Mock).mockReturnValue(locationTypes)
    ;(prisonApi.getAppointmentTypes as jest.Mock).mockReturnValue(appointmentTypes)

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
