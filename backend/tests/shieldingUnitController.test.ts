import moment from 'moment'
import shieldingUnitController from '../controllers/covid/shieldingUnitController'

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
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    covidService = {
      getAlertList: jest.fn(),
    }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: any; logError: a... Remove this comment to see the full error message
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
    const error = new Error('unexpected err')
    covidService.getAlertList.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })
})
