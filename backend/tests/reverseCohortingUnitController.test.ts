// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
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
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn(), status: jest.fn() }

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
})
