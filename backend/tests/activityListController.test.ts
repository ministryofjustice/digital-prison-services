import { factory } from '../controllers/controller'

import { makeResetError, makeError, makeResetErrorWithStack } from './helpers'

describe('Activity list controller', () => {
  const activityListService = {}
  let logError
  let getActivityListController

  const req = { originalUrl: 'http://localhost' }
  const res = { locals: {} }

  beforeEach(() => {
    logError = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getActivityList' does not exist on type ... Remove this comment to see the full error message
    activityListService.getActivityList = jest.fn()
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ activityListService: {}; logEr... Remove this comment to see the full error message
    getActivityListController = factory({ activityListService, logError }).getActivityList

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
    it('should log timeout error with ECONNRESET code', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getActivityList' does not exist on type ... Remove this comment to see the full error message
      activityListService.getActivityList.mockRejectedValue(makeResetError())

      await getActivityListController(req, res)

      expect(logError.mock.calls.length).toBe(1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
      expect(res.json.mock.calls.length).toBe(1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
      expect(res.end).toHaveBeenCalled()
    })

    it('should log timeout error with timeout in stack', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getActivityList' does not exist on type ... Remove this comment to see the full error message
      activityListService.getActivityList.mockRejectedValue(makeResetErrorWithStack())

      await getActivityListController(req, res)

      expect(logError.mock.calls.length).toBe(1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
      expect(res.json.mock.calls.length).toBe(1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
      expect(res.end).toHaveBeenCalled()
    })

    it('should log non-timeout error', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getActivityList' does not exist on type ... Remove this comment to see the full error message
      activityListService.getActivityList.mockRejectedValue(makeError('status', 403))

      await getActivityListController(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'json' does not exist on type '{ locals: ... Remove this comment to see the full error message
      expect(res.json.mock.calls.length).toBe(0)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.status).toHaveBeenCalledWith(403)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type '{ locals: {... Remove this comment to see the full error message
      expect(res.end).toHaveBeenCalled()
    })
  })
})
