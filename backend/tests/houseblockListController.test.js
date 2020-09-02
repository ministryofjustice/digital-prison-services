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
    houseblockListService.getHouseblockList = jest.fn()
    getHouseblockList = factory({ houseblockListService, logError }).getHouseblockList

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
    it('should NOT log timeout error when code ECONNRESET', async () => {
      houseblockListService.getHouseblockList.mockRejectedValue(makeResetError())

      await getHouseblockList(req, res)

      expect(logError.mock.calls.length).toBe(0)
      expect(res.json.mock.calls.length).toBe(0)
      expect(res.end).toHaveBeenCalled()
    })

    it('should NOT log timeout error when Timeout in stack', async () => {
      houseblockListService.getHouseblockList.mockRejectedValue(makeResetErrorWithStack())

      await getHouseblockList(req, res)

      expect(logError.mock.calls.length).toBe(0)
      expect(res.json.mock.calls.length).toBe(0)
      expect(res.end).toHaveBeenCalled()
    })

    it('should log non-timeout error', async () => {
      houseblockListService.getHouseblockList.mockRejectedValue(makeError('status', 403))

      await getHouseblockList(req, res)

      expect(res.json.mock.calls.length).toBe(0)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.end).toHaveBeenCalled()
    })
  })
})
