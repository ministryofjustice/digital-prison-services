// @ts-expect-error ts-migrate(2306) FIXME: File 'prisonstaf... Remove this comment to see the full error message
import { factory } from '../controllers/controller'

const { makeResetError, makeError, makeResetErrorWithStack } = require('./helpers')

describe('Activity list controller', () => {
  const houseblockListService = {}
  let logError
  let getHouseblockList

  const req = { originalUrl: 'http://localhost' }
  const res = { locals: {} }

  beforeEach(() => {
    logError = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHouseblockList' does not exist on typ... Remove this comment to see the full error message
    houseblockListService.getHouseblockList = jest.fn()
    getHouseblockList = factory({ houseblockListService, logError }).getHouseblockList

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'query' does not exist on type '{ origina... Remove this comment to see the full error message
    req.query = {
      agencyId: 'LEI',
      locationId: 1,
      timeSlot: 'AM',
      date: '10/12/2020',
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
    res.json = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
    res.end = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()
  })
  describe('Error handling', () => {
    it('should NOT log timeout error when code ECONNRESET', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHouseblockList' does not exist on typ... Remove this comment to see the full error message
      houseblockListService.getHouseblockList.mockRejectedValue(makeResetError())

      await getHouseblockList(req, res)

      expect(logError.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
      expect(res.json.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
      expect(res.end).toHaveBeenCalled()
    })

    it('should NOT log timeout error when Timeout in stack', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHouseblockList' does not exist on typ... Remove this comment to see the full error message
      houseblockListService.getHouseblockList.mockRejectedValue(makeResetErrorWithStack())

      await getHouseblockList(req, res)

      expect(logError.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
      expect(res.json.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
      expect(res.end).toHaveBeenCalled()
    })

    it('should log non-timeout error', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHouseblockList' does not exist on typ... Remove this comment to see the full error message
      houseblockListService.getHouseblockList.mockRejectedValue(makeError('status', 403))

      await getHouseblockList(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
      expect(res.json.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.status).toHaveBeenCalledWith(403)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
      expect(res.end).toHaveBeenCalled()
    })
  })
})
