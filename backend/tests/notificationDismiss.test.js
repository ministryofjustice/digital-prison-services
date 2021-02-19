const notificationDismissFactory = require('../controllers/notificationDismiss')

describe('Notification dismiss', () => {
  const notificationCookie = {}
  let notificationDismissController
  const req = {}
  let res

  beforeEach(() => {
    res = {
      status: jest.fn(),
      end: jest.fn(),
      redirect: jest.fn(),
    }
    notificationCookie.markAsDismissed = jest.fn()
    notificationDismissController = notificationDismissFactory({ notificationCookie })
  })

  it('should redirect when the request is not an ajax type request', async () => {
    await notificationDismissController(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })

  it('should respond with a bad request when there is missing post data', async () => {
    req.xhr = true

    await notificationDismissController(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.end).toHaveBeenCalled()
  })

  it('should call notification cookie with the correct parameters', async () => {
    req.xhr = true
    req.body = { id: 1, revision: 2 }

    await notificationDismissController(req, res)

    expect(notificationCookie.markAsDismissed(res, { id: 1, revision: 2 }))
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
  })
})
