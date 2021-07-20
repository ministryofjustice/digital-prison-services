const backToStart = require('../controllers/backToStart')

describe('Back to start url', () => {
  const prisonApi = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      session: {},
    }
    res = {
      locals: {},
      redirect: jest.fn(),
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getInmates' does not exist on type '{}'.
    prisonApi.getInmates = jest.fn().mockReturnValue([])

    controller = backToStart()
  })

  it('should redirect home by default', async () => {
    await controller(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })

  describe('when there is a returnUrl set in session', () => {
    it('should redirect to the returnUrl specified and remove it from session', async () => {
      req.session.returnUrl = '/url-to-return-to'

      await controller(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/url-to-return-to')
      expect(req.session).toEqual({})
    })
  })
})
