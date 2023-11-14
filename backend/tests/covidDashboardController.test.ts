import covidDashboard from '../controllers/covid/covidDashboardController'

describe('covid dashboard', () => {
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
      getCount: jest.fn(),
      getUnassignedNewEntrants: jest.fn(),
    }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: any; logError: a... Remove this comment to see the full error message
    controller = covidDashboard({ covidService, logError })
  })

  it('should render view with counts', async () => {
    covidService.getCount
      .mockResolvedValueOnce(21)
      .mockResolvedValueOnce(16)
      .mockResolvedValueOnce(9)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(14)

    covidService.getUnassignedNewEntrants.mockResolvedValueOnce([{}, {}, {}])

    await controller(req, res)

    expect(logError).not.toHaveBeenCalled()

    expect(covidService.getCount).toHaveBeenCalledWith(req, res)
    expect(covidService.getCount).toHaveBeenCalledWith(req, res, 'URCU')
    expect(covidService.getCount).toHaveBeenCalledWith(req, res, 'UPIU')
    expect(covidService.getCount).toHaveBeenCalledWith(req, res, 'USU')
    expect(covidService.getCount).toHaveBeenCalledWith(req, res, 'URS')
    expect(covidService.getUnassignedNewEntrants).toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith(
      'covid/dashboard.njk',
      expect.objectContaining({
        dashboardStats: {
          prisonPopulation: 21,
          reverseCohortingUnit: 16,
          protectiveIsolationUnit: 9,
          shieldingUnit: 5,
          refusingToShield: 14,
          notInUnitCount: 3,
        },
      })
    )
  })

  it('should handle errors', async () => {
    const error = new Error('unexpected err')
    covidService.getCount.mockRejectedValue(error)

    await expect(controller(req, res)).rejects.toThrowError(error)
  })
})
