const inToday = require('../../controllers/establishmentRoll/inToday')

const movementsService = {}

describe('In today', () => {
  let logError
  let controller
  const agencyId = 'LEI'
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'LEI', description: 'Leeds' } } } }
  const offenders = [
    {
      offenderNo: 'A1234AA',
      dateOfBirth: '1980-01-01',
      firstName: 'AAAAB',
      lastName: 'AAAAA',
      iepLevel: 'Basic',
      fromAgency: 'MDI',
      fromAgencyDescription: 'Moorland (HMP)',
      location: 'MDI-1-1',
      alerts: [],
      movementTime: '11:11:11',
      category: 'C',
    },
    {
      offenderNo: 'G0000AA',
      dateOfBirth: '1980-12-31',
      firstName: 'AAAAA',
      lastName: 'AAAAA',
      iepLevel: 'Enhanced',
      fromCity: 'Leeds',
      alerts: ['XR'],
      movementTime: '12:12:12',
      category: 'A',
    },
  ]
  beforeEach(() => {
    movementsService.getMovementsIn = jest.fn()
    logError = jest.fn()
    controller = inToday({ movementsService, logError })
    res.render = jest.fn()
  })

  it('should call the currently out endpoint', async () => {
    await controller(req, res)

    expect(movementsService.getMovementsIn).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return right error message', async () => {
    movementsService.getMovementsIn.mockRejectedValue(new Error('error'))
    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('error'), 'Failed to load in today page')
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      url: '/establishment-roll/in-today',
      homeUrl: 'http://localhost:3000/',
    })
  })

  it('should return response with data', async () => {
    movementsService.getMovementsIn.mockReturnValue(offenders)
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/inToday.njk',
      expect.objectContaining({
        results: [
          {
            alerts: [],
            dob: '01/01/1980',
            incentiveLevel: 'Basic',
            location: '1-1',
            name: 'Aaaaa, Aaaab',
            offenderNo: 'A1234AA',
            arrivedFrom: 'Moorland (HMP)',
            timeIn: '11:11',
            category: 'C',
          },
          {
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--racist', label: 'Racist' }],
            dob: '31/12/1980',
            incentiveLevel: 'Enhanced',
            name: 'Aaaaa, Aaaaa',
            offenderNo: 'G0000AA',
            location: undefined,
            arrivedFrom: 'Leeds',
            timeIn: '12:12',
            category: 'A',
          },
        ],
      })
    )
  })
})
