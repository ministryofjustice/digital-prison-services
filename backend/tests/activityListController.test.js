import { factory } from '../controllers/controller'

const { makeResetError, makeError, makeResetErrorWithStack } = require('./helpers')

describe('Activity list controller', () => {
  const activityListService = {}
  let logError
  let getActivityListController

  const req = { originalUrl: 'http://localhost' }
  const res = { locals: {} }

  beforeEach(() => {
    logError = jest.fn()
    activityListService.getActivityList = jest.fn()
    getActivityListController = factory({ activityListService, logError }).getActivityList

    req.query = {
      agencyId: 'LEI',
      locationId: 1,
      timeSlot: 'AM',
      date: '10/12/2020',
    }
    res.json = jest.fn()
    res.end = jest.fn()
    res.status = jest.fn()
  })
  describe('Error handling', () => {
    it('should NOT log timeout error with ECONNRESET code', async () => {
      activityListService.getActivityList.mockRejectedValue(makeResetError())

      await getActivityListController(req, res)

      expect(logError.mock.calls.length).toBe(0)
      expect(res.json.mock.calls.length).toBe(0)
      expect(res.end).toHaveBeenCalled()
    })

    it('should NOT log timeout error with timeout in stack', async () => {
      activityListService.getActivityList.mockRejectedValue(makeResetErrorWithStack())

      await getActivityListController(req, res)

      expect(logError.mock.calls.length).toBe(0)
      expect(res.json.mock.calls.length).toBe(0)
      expect(res.end).toHaveBeenCalled()
    })

    it('should log non-timeout error', async () => {
      activityListService.getActivityList.mockRejectedValue(makeError('status', 403))

      await getActivityListController(req, res)

      expect(res.json.mock.calls.length).toBe(0)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.end).toHaveBeenCalled()
    })
  })
})
