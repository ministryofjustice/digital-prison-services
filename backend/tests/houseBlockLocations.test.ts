import { getHouseblockLocationsFactory } from '../controllers/attendance/houseblockLocations'
import { makeResetError, makeError } from './helpers'

describe('House block locations', () => {
  const getClientCredentialsTokens = jest.fn()

  const systemContext = {
    access_token: 'someToken',
    refresh_token: undefined,
    expires_in: 100,
  }
  const locationsInsidePrisonApi = {}
  const res = { locals: {} }
  const req = {
    query: {
      agencyId: 'LEI',
    },
    originalUrl: 'http://localhost',
  }
  let controller
  let logError

  beforeEach(() => {
    getClientCredentialsTokens.mockResolvedValue(systemContext)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSearchGroups' does not exist on type '{}... Remove this comment to see the full error message
    locationsInsidePrisonApi.getSearchGroups = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    res.json = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    res.end = jest.fn()
    logError = jest.fn()

    controller = getHouseblockLocationsFactory(getClientCredentialsTokens, locationsInsidePrisonApi, logError)
  })

  it('should call getSearchGroups with the correct parameters', async () => {
    await controller.getHouseblockLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSearchGroups' does not exist on type '{}... Remove this comment to see the full error message
    expect(locationsInsidePrisonApi.getSearchGroups).toHaveBeenCalledWith(systemContext, 'LEI')
  })

  it('should pipe response out into json', async () => {
    const response = [
      {
        children: [
          {
            name: 'Landing A/1',
            key: '1',
          },
          {
            name: 'Landing A/2',
            key: '2',
          },
        ],
        key: 'A',
        name: 'Block A',
      },
    ]

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSearchGroups' does not exist on type '{}... Remove this comment to see the full error message
    locationsInsidePrisonApi.getSearchGroups.mockReturnValue(response)
    await controller.getHouseblockLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    expect(res.json).toHaveBeenCalledWith(response)
  })

  it('should catch and log error', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSearchGroups' does not exist on type '{}... Remove this comment to see the full error message
    locationsInsidePrisonApi.getSearchGroups.mockRejectedValue(new Error('Test error'))

    await controller.getHouseblockLocations(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Test error'), 'getHouseblockLocations()')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    expect(res.end).toHaveBeenCalled()
  })

  it('should not log connection reset API errors', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSearchGroups' does not exist on type '{}... Remove this comment to see the full error message
    locationsInsidePrisonApi.getSearchGroups.mockRejectedValue(makeResetError())

    await controller.getHouseblockLocations(req, res)

    expect(logError.mock.calls.length).toBe(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    expect(res.end).toHaveBeenCalled()
  })

  it('should respond with the correct status codes', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSearchGroups' does not exist on type '{}... Remove this comment to see the full error message
    locationsInsidePrisonApi.getSearchGroups.mockRejectedValue(makeError('status', 403))
    await controller.getHouseblockLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status).toHaveBeenCalledWith(403)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    expect(res.end).toHaveBeenCalled()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSearchGroups' does not exist on type '{}... Remove this comment to see the full error message
    locationsInsidePrisonApi.getSearchGroups.mockRejectedValue(makeError('response', { status: 404 }))
    await controller.getHouseblockLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status).toHaveBeenCalledWith(404)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    expect(res.end).toHaveBeenCalled()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSearchGroups' does not exist on type '{}... Remove this comment to see the full error message
    locationsInsidePrisonApi.getSearchGroups.mockRejectedValue(new Error())
    await controller.getHouseblockLocations(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.status).toHaveBeenCalledWith(500)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    expect(res.end).toHaveBeenCalled()
  })
})
