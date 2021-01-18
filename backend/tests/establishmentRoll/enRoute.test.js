const enRoute = require('../../controllers/establishmentRoll/enRoute')

const movementsService = {}

describe('En route test', () => {
  let logError
  let controller
  const agencyId = 'LEI'
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'LEI', description: 'Leeds' } } }, status: jest.fn() }
  const offenders = [
    {
      offenderNo: 'A1234AA',
      bookingId: -1,
      dateOfBirth: '1980-01-01',
      firstName: 'AAAAB',
      lastName: 'AAAAA',
      fromAgencyDescription: 'Hull (HMP)',
      movementDate: '2010-10-10',
      movementTime: '01:01:45',
      movementReasonDescription: 'Normal transfer',
      location: 'LEI-A-01-011',
      alerts: ['XR'],
      category: 'A',
    },
    {
      offenderNo: 'G0000AA',
      bookingId: -2,
      dateOfBirth: '1980-12-31',
      firstName: 'AAAAA',
      lastName: 'AAAAA',
      fromAgencyDescription: 'Outside',
      movementTime: '23:59:59',
      movementReasonDescription: 'Normal transfer',
      location: 'LEI-A-02-011',
      alerts: [],
      category: 'C',
    },
  ]
  beforeEach(() => {
    movementsService.getOffendersEnRoute = jest.fn()
    logError = jest.fn()
    controller = enRoute({ movementsService, logError })
    res.render = jest.fn()
  })

  it('should call the en route endpoint', async () => {
    await controller(req, res)

    expect(movementsService.getOffendersEnRoute).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return right error message', async () => {
    movementsService.getOffendersEnRoute.mockRejectedValue(new Error('error'))
    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('error'), 'Failed to load en route page')
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      url: '/establishment-roll/en-route',
      homeUrl: 'http://localhost:3000/',
    })
  })

  it('should return response with data', async () => {
    movementsService.getOffendersEnRoute.mockReturnValue(offenders)
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/enRoute.njk',
      expect.objectContaining({
        agencyName: 'Leeds',
        results: [
          {
            name: 'Aaaaa, Aaaab',
            offenderNo: 'A1234AA',
            dob: '01/01/1980',
            departed: '<div>01:01</div>10/10/2010',
            from: 'Hull (HMP)',
            reason: 'Normal transfer',
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--racist', label: 'Racist' }],
            category: 'A',
          },
          {
            alerts: [],
            departed: '<div>23:59</div>Invalid date',
            dob: '31/12/1980',
            from: 'Outside',
            name: 'Aaaaa, Aaaaa',
            offenderNo: 'G0000AA',
            reason: 'Normal transfer',
            category: 'C',
          },
        ],
      })
    )
  })
})
