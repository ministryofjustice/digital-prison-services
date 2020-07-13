const moment = require('moment')
const reverseCohortingUnit = require('../controllers/covid/reverseCohortingUnitController')

describe('reverse cohorting unit', () => {
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
      getUnassignedNewEntrants: jest.fn(),
    }
    controller = reverseCohortingUnit({ covidService, logError })
  })

  it('should render view with results', async () => {
    const results = [
      {
        alertCreated: '2020-01-03',
        assignedLivingUnitDesc: '1-2-017',
        bookingId: 123,
        name: 'Stewart, James',
        offenderNo: 'AA1234A',
      },
    ]

    covidService.getAlertList.mockResolvedValueOnce(results)
    covidService.getUnassignedNewEntrants.mockResolvedValueOnce([{}, {}, {}])

    await controller(req, res)

    expect(logError).not.toHaveBeenCalled()

    expect(covidService.getAlertList).toHaveBeenCalledWith(res, 'URCU')

    expect(res.render).toHaveBeenCalledWith('covid/reverseCohortingUnit.njk', {
      title: 'Prisoners in the Reverse Cohorting Unit',
      results: [
        {
          alertCreated: moment('2020-01-03'),
          assignedLivingUnitDesc: '1-2-017',
          bookingId: 123,
          expectedMoveDate: moment('2020-01-03').add(14, 'days'),
          isOverdue: true,
          name: 'Stewart, James',
          offenderNo: 'AA1234A',
        },
      ],
      notInUnitCount: 3,
    })
  })

  it('should handle errors', async () => {
    const error = Error('unexpected err')
    covidService.getAlertList.mockRejectedValue(error)

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to load reverse cohorting list')

    expect(res.render).toHaveBeenCalledWith(
      'error.njk',
      expect.objectContaining({
        url: '/current-covid-units/reverse-cohorting-unit',
      })
    )
  })
})
