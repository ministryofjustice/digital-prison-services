const { getActivityLocationsFactory } = require('../controllers/attendance/activityLocations')
const { makeError, makeResetError, makeResetErrorWithStack } = require('./helpers')

describe('Activity locations', () => {
  let getActivityLocations
  let logError
  const elite2Api = {}
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: {} }

  beforeEach(() => {
    logError = jest.fn()
    elite2Api.searchActivityLocations = jest.fn().mockResolvedValue({ location: 'test' })

    getActivityLocations = getActivityLocationsFactory({ elite2Api, logError }).getActivityLocations

    res.json = jest.fn()
    res.end = jest.fn()
    res.status = jest.fn()

    req.query = {
      agencyId: 'LEI',
      timeSlot: 'AM',
      bookedOnDay: '10/12/2020',
    }
  })

  it('should make a call to get locations for activity using the correct parameters', async () => {
    await getActivityLocations(req, res)

    expect(elite2Api.searchActivityLocations).toHaveBeenCalledWith({}, 'LEI', '2020-12-10', 'AM')
    expect(res.json).toHaveBeenCalledWith({ location: 'test' })
  })

  it('should log API errors', async () => {
    elite2Api.searchActivityLocations.mockRejectedValue(new Error('test'))
    await getActivityLocations(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', new Error('test'), 'getActivityLocations()')
  })

  it('should not log connection reset API errors', async () => {
    elite2Api.searchActivityLocations.mockRejectedValue(makeResetError())
    await getActivityLocations(req, res)

    expect(logError.mock.calls.length).toBe(0)
    expect(res.status.mock.calls.length).toBe(0)
    expect(res.json).toHaveBeenCalledWith({ error: true })
  })

  it('should not log connection reset API errors with Timout in stack', async () => {
    elite2Api.searchActivityLocations.mockRejectedValue(makeResetErrorWithStack())
    await getActivityLocations(req, res)

    expect(logError.mock.calls.length).toBe(0)
    expect(res.status.mock.calls.length).toBe(0)
    expect(res.json).toHaveBeenCalledWith({ error: true })
  })

  it('should respond with the correct status codes', async () => {
    elite2Api.searchActivityLocations.mockRejectedValue(makeError('status', 403))
    await getActivityLocations(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.end).toHaveBeenCalled()

    elite2Api.searchActivityLocations.mockRejectedValue(makeError('response', { status: 404 }))
    await getActivityLocations(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.end).toHaveBeenCalled()

    elite2Api.searchActivityLocations.mockRejectedValue(new Error())
    await getActivityLocations(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.end).toHaveBeenCalled()
  })
})
