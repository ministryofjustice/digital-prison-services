const moment = require('moment')
const protectiveIsolationUnit = require('../controllers/covid/protectiveIsolationUnitController')

describe('protective isolation unit', () => {
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
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    covidService = {
      getAlertList: jest.fn(),
    }
    controller = protectiveIsolationUnit({ covidService, logError, nowGetter: () => now })
  })

  it('should render view with results', async () => {
    const results = [
      {
        alertCreated: moment(now).subtract(3, 'days').format('YYYY-MM-DD'),
        assignedLivingUnitDesc: '1-2-017',
        bookingId: 123,
        name: 'Stewart, James',
        offenderNo: 'AA1234A',
      },
    ]

    covidService.getAlertList.mockResolvedValueOnce(results)

    await controller(req, res)

    expect(logError).not.toHaveBeenCalled()

    expect(covidService.getAlertList).toHaveBeenCalledWith(res, 'UPIU')

    expect(res.render).toHaveBeenCalledWith('covid/protectiveIsolationUnit.njk', {
      title: 'Prisoners in the Protective Isolation Unit',
      results: [
        {
          alertCreated: moment(now.subtract(3, 'days').format('YYYY-MM-DD')),
          assignedLivingUnitDesc: '1-2-017',
          bookingId: 123,
          daysInUnit: 3,
          name: 'Stewart, James',
          offenderNo: 'AA1234A',
        },
      ],
    })
  })

  it('should handle errors', async () => {
    const error = new Error('unexpected err')
    covidService.getAlertList.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })
})
