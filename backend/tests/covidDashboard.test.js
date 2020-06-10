const covidDashboard = require('../controllers/covid/covidDashboard')

describe('covid dashboard', () => {
  let req
  let res
  let logError
  let elite2Api
  let controller

  const requestHeaders = {
    'page-limit': 1,
    'page-offset': 0,
  }

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
    }
    res = { locals: { user: { activeCaseLoad: { caseLoadId: 'MDI' } } }, render: jest.fn() }

    logError = jest.fn()

    elite2Api = {
      getInmates: jest.fn(),
    }
    controller = covidDashboard({ elite2Api, logError })
  })

  const returnSize = count => context => {
    // eslint-disable-next-line no-param-reassign,
    context.responseHeaders = { 'total-records': count }
  }

  it('should render view with counts', async () => {
    elite2Api.getInmates
      .mockImplementationOnce(returnSize(21))
      .mockImplementationOnce(returnSize(5))
      .mockImplementationOnce(returnSize(16))
      .mockImplementationOnce(returnSize(14))
      .mockImplementationOnce(returnSize(9))

    await controller(req, res)

    expect(logError).not.toHaveBeenCalled()

    const expectedContext = expect.objectContaining({ requestHeaders })

    expect(logError).not.toHaveBeenCalled()

    expect(elite2Api.getInmates).toHaveBeenCalledWith(expectedContext, 'MDI', {})
    expect(elite2Api.getInmates).toHaveBeenCalledWith(expectedContext, 'MDI', { alerts: 'URCU' })
    expect(elite2Api.getInmates).toHaveBeenCalledWith(expectedContext, 'MDI', { alerts: 'UPIU' })
    expect(elite2Api.getInmates).toHaveBeenCalledWith(expectedContext, 'MDI', { alerts: 'USU' })
    expect(elite2Api.getInmates).toHaveBeenCalledWith(expectedContext, 'MDI', { alerts: 'URS' })

    expect(res.render).toHaveBeenCalledWith(
      'covid/dashboard.njk',
      expect.objectContaining({
        dashboardStats: {
          prisonPopulation: 21,
          protectiveIsolationUnit: 16,
          refusingToShield: 9,
          reverseCohortingUnit: 5,
          shieldingUnit: 14,
        },
      })
    )
  })

  it('should handle errors', async () => {
    const error = Error('unexpected err')
    elite2Api.getInmates.mockRejectedValue(error)

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to load dashboard stats')

    expect(res.render).toHaveBeenCalledWith(
      'error.njk',
      expect.objectContaining({
        url: '/current-covid-units',
      })
    )
  })
})
