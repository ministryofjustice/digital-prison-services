// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'returnUrl'... Remove this comment to see the full error message
const returnUrl = require('./returnUrl')

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
