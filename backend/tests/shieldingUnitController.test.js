const moment = require('moment')
const shieldingUnitController = require('../controllers/covid/shieldingUnitController')

describe('shielding unit', () => {
  let req
  let res
  let logError
  let covidService
  let controller

  const now = moment('2020-01-10')

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
    }
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

    logError = jest.fn()

    covidService = {
      getAlertList: jest.fn(),
    }
    controller = shieldingUnitController({ covidService, logError, nowGetter: () => now })
  })

  it('should render view with results', async () => {
    const results = [
      {
        alertCreated: moment(now).format('YYYY-MM-DD'),
        assignedLivingUnitDesc: '1-2-017',
        bookingId: 123,
        name: 'Stewart, James',
        offenderNo: 'AA1234A',
      },
    ]

    covidService.getAlertList.mockResolvedValueOnce(results)

    await controller(req, res)

    expect(logError).not.toHaveBeenCalled()

    expect(covidService.getAlertList).toHaveBeenCalledWith(res, 'USU')

    expect(res.render).toHaveBeenCalledWith('covid/shieldingUnit.njk', {
      title: 'Prisoners in the Shielding Unit',
      results: [
        {
          alertCreated: now,
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

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to load shielding list')

    expect(res.render).toHaveBeenCalledWith(
      'error.njk',
      expect.objectContaining({
        url: '/current-covid-units/shielding-unit',
      })
    )
  })
})
