import { appointmentsServiceFactory } from '../services/appointmentsService'
import { prisonApiFactory } from '../api/prisonApi'
import { locationsInsidePrisonApiFactory, NonResidentialUsageType } from '../api/locationsInsidePrisonApi'
import { nomisMappingClientFactory } from '../api/nomisMappingClient'

describe('Appointments service', () => {
  const prisonApi: Partial<ReturnType<typeof prisonApiFactory>> = {}
  const locationsInsidePrisonApi: Partial<ReturnType<typeof locationsInsidePrisonApiFactory>> = {}
  const nomisMapping: Partial<ReturnType<typeof nomisMappingClientFactory>> = {
    getNomisLocationMappingByDpsLocationId: (_context, id) =>
      ({
        'abc-1': { dpsLocationId: 'abc-1', nomisLocationId: 27187 },
        'abc-2': { dpsLocationId: 'abc-2', nomisLocationId: 27188 },
      }[id]),
  }
  const locals = { _type: 'locals' }
  const context = { _type: 'context' }
  const agency = 'LEI'
  const appointmentTypes = [{ code: 'ACTI', description: 'Activities' }]
  const locationTypes = [
    {
      id: 'abc-1',
      locationType: 'ADJU',
      pathHierarchy: 'RES-MCASU-MCASU',
      prisonId: 'MDI',
      parentId: 'abc-0',
      key: 'MDI-RES-MCASU-MCASU',
      localName: 'Adj',
    },
    {
      id: 'abc-2',
      locationType: 'ADJU',
      pathHierarchy: 'RES-MCASU-MCASU',
      prisonId: 'MDI',
      parentId: 'abc-0',
      key: 'MDI-RES-MCASU-MCASU',
    },
  ]

  let service

  beforeEach(() => {
    locationsInsidePrisonApi.getLocationsByNonResidentialUsageType = jest.fn()
    prisonApi.getAppointmentTypes = jest.fn()
    prisonApi.addAppointments = jest.fn()

    service = appointmentsServiceFactory(
      prisonApi as ReturnType<typeof prisonApiFactory>,
      locationsInsidePrisonApi as ReturnType<typeof locationsInsidePrisonApiFactory>,
      nomisMapping as ReturnType<typeof nomisMappingClientFactory>
    )
  })

  it('should make a request for appointment locations and types', async () => {
    await service.getAppointmentOptions(locals, context, agency)

    expect(locationsInsidePrisonApi.getLocationsByNonResidentialUsageType).toHaveBeenCalledWith(
      context,
      agency,
      NonResidentialUsageType.APPOINTMENT
    )
    expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(locals)
  })

  it('should handle empty responses from appointment types and locations', async () => {
    const response = await service.getAppointmentOptions(context, agency)

    expect(response).toEqual({})
  })

  it('should map appointment types and locations correctly', async () => {
    ;(locationsInsidePrisonApi.getLocationsByNonResidentialUsageType as jest.Mock).mockReturnValue(locationTypes)
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
