import returnUrl from './returnUrl'

describe('Return URL', () => {
  const res = {}
  let req
  let next
  let controller

  beforeEach(() => {
    req = { session: {}, query: {} }
    next = jest.fn()

    controller = returnUrl()
  })

  it('should not set a returnUrl in session by default', async () => {
    await controller(req, res, next)

    expect(req.session.returnUrl).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })

  describe('when there is a returnUrl query parameter', () => {
    it('should set returnUrl in session', async () => {
      req.query.returnUrl = '/url-to-return-to'

      await controller(req, res, next)

      expect(req.session.returnUrl).toEqual('/url-to-return-to')
      expect(next).toHaveBeenCalled()
    })
  })
})
