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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'markAsDismissed' does not exist on type ... Remove this comment to see the full error message
    notificationCookie.markAsDismissed = jest.fn()
    notificationDismissController = notificationDismissFactory({ notificationCookie })
  })

  it('should redirect when the request is not an ajax type request', async () => {
    await notificationDismissController(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })

  it('should respond with a bad request when there is missing post data', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'xhr' does not exist on type '{}'.
    req.xhr = true

    await notificationDismissController(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.end).toHaveBeenCalled()
  })

  it('should call notification cookie with the correct parameters', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'xhr' does not exist on type '{}'.
    req.xhr = true
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{}'.
    req.body = { id: 1, revision: 2 }

    await notificationDismissController(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'markAsDismissed' does not exist on type ... Remove this comment to see the full error message
    expect(notificationCookie.markAsDismissed(res, { id: 1, revision: 2 }))
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
  })
})
