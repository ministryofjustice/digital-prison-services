const notificationCookie = require('../services/notificationCookie')

describe('Notification cookie', () => {
  let res
  let req

  beforeEach(() => {
    res = {
      cookie: jest.fn(),
    }
    req = {
      cookies: {
        'ui-notification-bar': '1-2',
      },
    }
  })

  it('should store cookie correctly', () => {
    notificationCookie.markAsDismissed(res, { id: 1, revision: 2 })
    expect(res.cookie).toHaveBeenCalledWith('ui-notification-bar', '1-2', { httpOnly: true, maxAge: 4492800000 })
  })

  it('should find matching cookie', () => {
    expect(notificationCookie.alreadyDismissed(req, { id: 1, revision: 2 })).toBeTruthy()
  })

  it('should NOT find matching cookie', () => {
    expect(notificationCookie.alreadyDismissed(req, { id: 1, revision: 1 })).toBeFalsy()
  })
})
