// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'shieldingU... Remove this comment to see the full error message
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
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn(), status: jest.fn() }

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
    const error = new Error('unexpected err')
    covidService.getAlertList.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })
})
