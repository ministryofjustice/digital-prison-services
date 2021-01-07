const currentlyOut = require('../../controllers/establishmentRoll/currentlyOut')

const movementsService = {}

describe('Currently out', () => {
  let logError
  let controller
  const livingUnitId = 1234
  const req = { originalUrl: 'http://localhost', params: { livingUnitId } }
  const res = { locals: {}, status: jest.fn() }
  const offenders = [
    {
      offenderNo: 'A1234AA',
      dateOfBirth: '1980-01-01',
      firstName: 'AAAAB',
      lastName: 'AAAAA',
      iepLevel: 'Basic',
      fromAgency: 'LEI',
      location: 'LEI-1-1',
      toCity: 'Somewhere',
      alerts: [],
      commentText: 'Comments',
      category: 'C',
    },
    {
      offenderNo: 'G0000AA',
      dateOfBirth: '1980-12-31',
      firstName: 'AAAAA',
      lastName: 'AAAAA',
      iepLevel: 'Enhanced',
      fromAgency: 'LEI',
      location: 'LEI-1-2',
      toCity: 'Somewhere Else',
      alerts: ['XR'],
      commentText: 'Comments',
      category: 'A',
    },
  ]
  beforeEach(() => {
    movementsService.getOffendersCurrentlyOutOfLivingUnit = jest.fn()
    logError = jest.fn()
    controller = currentlyOut({ movementsService, logError })
    res.render = jest.fn()
  })

  it('should call the currently out endpoint', async () => {
    await controller(req, res)

    expect(movementsService.getOffendersCurrentlyOutOfLivingUnit).toHaveBeenCalledWith(res.locals, livingUnitId)
  })

  it('should return right error message', async () => {
    movementsService.getOffendersCurrentlyOutOfLivingUnit.mockRejectedValue(new Error('error'))
    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('error'), 'Failed to load currently out page')
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      url: '/establishment-roll/currently-out',
      homeUrl: 'http://localhost:3000/',
    })
  })

  it('should return response with data', async () => {
    movementsService.getOffendersCurrentlyOutOfLivingUnit.mockReturnValue({ location: 'A', currentlyOut: offenders })
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/currentlyOut.njk',
      expect.objectContaining({
        livingUnitName: 'A',
        results: [
          {
            alerts: [],
            comment: 'Comments',
            currentLocation: 'Somewhere',
            dob: '01/01/1980',
            incentiveLevel: 'Basic',
            location: '1-1',
            name: 'Aaaaa, Aaaab',
            offenderNo: 'A1234AA',
            category: 'C',
          },
          {
            alerts: [{ alertCodes: ['XR'], classes: 'alert-status alert-status--racist', label: 'Racist' }],
            comment: 'Comments',
            currentLocation: 'Somewhere Else',
            dob: '31/12/1980',
            incentiveLevel: 'Enhanced',
            location: '1-2',
            name: 'Aaaaa, Aaaaa',
            offenderNo: 'G0000AA',
            category: 'A',
          },
        ],
      })
    )
  })
})
