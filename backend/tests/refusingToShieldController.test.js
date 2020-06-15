const shieldingUnitController = require('../controllers/covid/refusingToShieldController')

describe('refusing to shield', () => {
  let req
  let res
  let logError
  let covidService
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
    }
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

    logError = jest.fn()

    covidService = {
      getAlertList: jest.fn(),
    }
    controller = shieldingUnitController({ covidService, logError })
  })

  it('should render view with results', async () => {
    const results = [
      {
        alertCreated: '2020-01-02',
        assignedLivingUnitDesc: '1-2-017',
        bookingId: 123,
        name: 'Stewart, James',
        offenderNo: 'AA1234A',
      },
    ]

    covidService.getAlertList.mockResolvedValueOnce(results)

    await controller(req, res)

    expect(logError).not.toHaveBeenCalled()

    expect(covidService.getAlertList).toHaveBeenCalledWith(res, 'URS')

    expect(res.render).toHaveBeenCalledWith('covid/refusingToShield.njk', {
      title: 'Prisoners refusing to shield',
      results: [
        {
          assignedLivingUnitDesc: '1-2-017',
          bookingId: 123,
          name: 'Stewart, James',
          offenderNo: 'AA1234A',
        },
      ],
    })
  })

  it('should handle errors', async () => {
    const error = Error('unexpected err')
    covidService.getAlertList.mockRejectedValue(error)

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(
      'http://localhost',
      error,
      'Failed to load list of prisoners refusing to shield'
    )

    expect(res.render).toHaveBeenCalledWith(
      'error.njk',
      expect.objectContaining({
        url: '/current-covid-units/refusing-to-shield',
      })
    )
  })
})
