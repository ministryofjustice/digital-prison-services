const spaceCreatedController = require('../../controllers/cellMove/spaceCreated')

describe('Space created', () => {
  let req
  let res
  let controller

  const prisonApi = {}

  const offenderNo = 'ABC123'

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
    }
    res = { locals: {}, render: jest.fn() }

    prisonApi.getDetails = jest.fn()

    controller = spaceCreatedController({ prisonApi })
  })

  describe('with data', () => {
    beforeEach(() => {
      prisonApi.getDetails.mockResolvedValue({ firstName: 'Barry', lastName: 'Jones' })
    })

    it('should render the correct template with the correct values', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('cellMove/spaceCreated.njk', {
        breadcrumbPrisonerName: 'Jones, Barry',
        name: 'Barry Jones',
        offenderNo: 'ABC123',
        prisonerProfileLink: '/prisoner/ABC123',
        prisonerSearchLink: '/prisoner-search',
        title: 'Barry Jones has been moved',
      })
    })
  })

  describe('when there are errors', () => {
    it('set the redirect and home urls and throw the error', async () => {
      const error = new Error('Network error')
      prisonApi.getDetails.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
      expect(res.locals.homeUrl).toBe(`/prisoner/${offenderNo}`)
    })
  })
})
