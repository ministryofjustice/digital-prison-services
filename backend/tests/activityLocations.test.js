const { getActivityLocationsFactory } = require('../controllers/attendance/activityLocations')

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
  })

  it('should make a call to get locations for activity using the correct parameters', async () => {
    req.query = {
      agencyId: 'LEI',
      timeSlot: 'AM',
      bookedOnDay: '10/12/2020',
    }

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
    class ConnectionResetError extends Error {
      constructor() {
        super()
        this.code = 'ECONNRESET'
      }
    }
    elite2Api.searchActivityLocations.mockRejectedValue(new ConnectionResetError())
    await getActivityLocations(req, res)

    expect(logError.mock.calls.length).toBe(0)
  })
})
