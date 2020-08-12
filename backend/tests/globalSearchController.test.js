import { factory } from '../controllers/controller'

describe('Global seach controller', () => {
  const globalSeachService = {}
  let req
  let res

  beforeEach(() => {
    globalSeachService.globalSearch = jest.fn()
    req = { session: {}, query: {}, headers: {} }
  })
  describe('Sets search url correctly', () => {
    const { globalSearch } = factory([{ globalSeachService }])
    it('should NOT set prisonerSearchUrl to the originalUrl if there has NOT been a search', async () => {
      req.query = {}
      await globalSearch(req, res)

      expect(req.session.prisonerSearchUrl).toEqual(undefined)
    })

    it('should set prisonerSearchUrl to the originalUrl if there has been a search', async () => {
      req.query = { searchText: 'Smith' }
      req.headers.referer = 'localhost:3002/global-search-results?searchText=Smith'
      await globalSearch(req, res)

      expect(req.session).toEqual({ prisonerSearchUrl: req.headers.referer })
    })
  })
})
