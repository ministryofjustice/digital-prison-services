const bulkAppointmebulkAppointmentsServiceFactory = require('../controllers/bulk-appointments-service')

describe('Bulk appointments service', () => {
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

    service = bulkAppointmebulkAppointmentsServiceFactory(elite2Api)
  })

  it('should make a request for appointment locations and types', async () => {
    await service.getBulkAppointmentsViewModel(context, agency)

    expect(elite2Api.getLocationsForAppointments).toHaveBeenCalledWith(context, agency)
    expect(elite2Api.getAppointmentTypes).toHaveBeenCalledWith(context)
  })

  it('should handle empty responses from appointment types and locations', async () => {
    const response = await service.getBulkAppointmentsViewModel(context, agency)

    expect(response).toEqual({})
  })

  it('should map appointment types and locations correctly', async () => {
    elite2Api.getLocationsForAppointments.mockReturnValue(locationTypes)
    elite2Api.getAppointmentTypes.mockReturnValue(appointmentTypes)

    const response = await service.getBulkAppointmentsViewModel(context, agency)

    expect(response).toEqual({
      appointmentTypes: [{ id: 'ACTI', description: 'Activities' }],
      locationTypes: [{ id: 27187, description: 'Adj' }, { id: 27188, description: 'RES-MCASU-MCASU' }],
    })
  })
})
