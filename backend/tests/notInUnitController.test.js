const moment = require('moment')
const notInUnitController = require('../controllers/covid/notInUnitController')

describe('not in unit', () => {
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
      getUnassignedNewEntrants: jest.fn(),
    }
    controller = notInUnitController({ covidService, logError })
  })

  it('should render view with results', async () => {
    const results = [
      {
        arrivalDate: '2020-01-02',
        assignedLivingUnitDesc: '1-2-017',
        bookingId: 123,
        name: 'Stewart, James',
        offenderNo: 'AA1234A',
      },
    ]

    covidService.getUnassignedNewEntrants.mockResolvedValueOnce(results)

    await controller(req, res)

    expect(logError).not.toHaveBeenCalled()

    expect(covidService.getUnassignedNewEntrants).toHaveBeenCalledWith(res)

    expect(res.render).toHaveBeenCalledWith('covid/notInUnit.njk', {
      title: 'Newly arrived prisoners not in Reverse Cohorting Unit',
      results: [
        {
          arrivalDate: moment('2020-01-02'),
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
    covidService.getUnassignedNewEntrants.mockRejectedValue(error)

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to load not in unit list')

    expect(res.render).toHaveBeenCalledWith(
      'error.njk',
      expect.objectContaining({
        url: '/current-covid-units/not-in-unit',
      })
    )
  })
})
