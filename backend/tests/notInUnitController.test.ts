import moment from 'moment'
import notInUnitController from '../controllers/covid/notInUnitController'

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
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    covidService = {
      getUnassignedNewEntrants: jest.fn(),
    }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: any; logError: a... Remove this comment to see the full error message
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

    expect(covidService.getUnassignedNewEntrants).toHaveBeenCalledWith(req, res)

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
})
