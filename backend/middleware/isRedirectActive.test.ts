import isRedirectActive from './isRedirectActive'

describe('Check if redirect is active', () => {
  const res = {}
  let req
  let next
  let controller
  describe('when the redirect is active', () => {
    beforeEach(() => {
      req = { session: {}, query: {} }
      next = jest.fn()

      controller = isRedirectActive()
    })

    it('Then isRedirectActive should return false', async () => {
      await controller(req, res, next)

      expect(req.session.isRedirectActive).toEqual(false)
      expect(next).toHaveBeenCalled()
    })
  })
})
