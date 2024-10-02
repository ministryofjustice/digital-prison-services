import { factory } from '../controllers/controller'

import { makeResetError, makeError, makeResetErrorWithStack } from './helpers'

describe('Activity list controller', () => {
  const activityListService = {
    getActivityList: jest.fn(),
  }
  const houseblockListService = {}
  const attendanceService = {}
  const offenderLoader = {}
  const csvParserService = {}
  const offenderActivitiesService = {}
  const caseNotesApi = {}
  const prisonApi = {}
  let logError
  let getActivityListController

  const req = { originalUrl: 'http://localhost', query: {} }
  const res = { locals: {}, json: jest.fn(), end: jest.fn(), status: jest.fn() }

  beforeEach(() => {
    logError = jest.fn()
    activityListService.getActivityList = jest.fn()

    getActivityListController = factory({
      activityListService,
      houseblockListService,
      attendanceService,
      offenderLoader,
      csvParserService,
      offenderActivitiesService,
      caseNotesApi,
      logError,
      prisonApi,
    }).getActivityList

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
    it('should log timeout error with ECONNRESET code', async () => {
      activityListService.getActivityList.mockRejectedValue(makeResetError())

      await getActivityListController(req, res)

      expect(logError.mock.calls.length).toBe(1)
      expect(res.json.mock.calls.length).toBe(1)
      expect(res.end).toHaveBeenCalled()
    })

    it('should log timeout error with timeout in stack', async () => {
      activityListService.getActivityList.mockRejectedValue(makeResetErrorWithStack())

      await getActivityListController(req, res)

      expect(logError.mock.calls.length).toBe(1)
      expect(res.json.mock.calls.length).toBe(1)
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
