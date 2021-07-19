// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getActivit... Remove this comment to see the full error message
const { getActivityLocationsFactory } = require('../controllers/attendance/activityLocations')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'makeError'... Remove this comment to see the full error message
const { makeError, makeResetError, makeResetErrorWithStack } = require('./helpers')

describe('Activity locations', () => {
  let getActivityLocations
  let logError
  const prisonApi = {}
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: {} }

  beforeEach(() => {
    logError = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchActivityLocations' does not exist ... Remove this comment to see the full error message
    prisonApi.searchActivityLocations = jest.fn().mockResolvedValue({ location: 'test' })

    getActivityLocations = getActivityLocationsFactory({ prisonApi, logError }).getActivityLocations

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    res.json = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    res.end = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'query' does not exist on type '{ origina... Remove this comment to see the full error message
    req.query = {
      agencyId: 'LEI',
      timeSlot: 'AM',
      bookedOnDay: '10/12/2020',
    }
  })

  it('should make a call to get locations for activity using the correct parameters', async () => {
    await getActivityLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchActivityLocations' does not exist ... Remove this comment to see the full error message
    expect(prisonApi.searchActivityLocations).toHaveBeenCalledWith({}, 'LEI', '2020-12-10', 'AM')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    expect(res.json).toHaveBeenCalledWith({ location: 'test' })
  })

  it('should log API errors', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchActivityLocations' does not exist ... Remove this comment to see the full error message
    prisonApi.searchActivityLocations.mockRejectedValue(new Error('test'))
    await getActivityLocations(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', new Error('test'), 'getActivityLocations()')
  })

  it('should not log connection reset API errors', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchActivityLocations' does not exist ... Remove this comment to see the full error message
    prisonApi.searchActivityLocations.mockRejectedValue(makeResetError())
    await getActivityLocations(req, res)

    expect(logError.mock.calls.length).toBe(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status.mock.calls.length).toBe(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    expect(res.json).toHaveBeenCalledWith({ error: true })
  })

  it('should not log connection reset API errors with Timout in stack', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchActivityLocations' does not exist ... Remove this comment to see the full error message
    prisonApi.searchActivityLocations.mockRejectedValue(makeResetErrorWithStack())
    await getActivityLocations(req, res)

    expect(logError.mock.calls.length).toBe(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status.mock.calls.length).toBe(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    expect(res.json).toHaveBeenCalledWith({ error: true })
  })

  it('should respond with the correct status codes', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchActivityLocations' does not exist ... Remove this comment to see the full error message
    prisonApi.searchActivityLocations.mockRejectedValue(makeError('status', 403))
    await getActivityLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status).toHaveBeenCalledWith(403)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    expect(res.end).toHaveBeenCalled()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchActivityLocations' does not exist ... Remove this comment to see the full error message
    prisonApi.searchActivityLocations.mockRejectedValue(makeError('response', { status: 404 }))
    await getActivityLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status).toHaveBeenCalledWith(404)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    expect(res.end).toHaveBeenCalled()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchActivityLocations' does not exist ... Remove this comment to see the full error message
    prisonApi.searchActivityLocations.mockRejectedValue(new Error())
    await getActivityLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status).toHaveBeenCalledWith(500)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    expect(res.end).toHaveBeenCalled()
  })
})
