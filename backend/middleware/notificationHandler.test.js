const notificationHandlerFactory = require('./notificationHandler')

describe('Notification handler', () => {
  const contentfulService = {}
  let notificationHandler
  let req
  let res
  let next
  let logError

  beforeEach(() => {
    next = jest.fn()
    res = {
      locals: {},
    }
    req = {
      originalUrl: 'http://localhost',
    }
    logError = jest.fn()
    contentfulService.getMostRecentNotificationAsHtml = jest.fn()
    notificationHandler = notificationHandlerFactory({ contentfulService, logError })
  })

  it('should make a call to the contentful service', async () => {
    await notificationHandler(req, res, next)

    expect(contentfulService.getMostRecentNotificationAsHtml).toHaveBeenCalledWith(req)
  })

  it('should populate res.locals with notification content', async () => {
    contentfulService.getMostRecentNotificationAsHtml = jest.fn().mockResolvedValue({
      id: 1,
      revision: 2,
      content: '<h1>hello, world</h1>',
    })

    await notificationHandler(req, res, next)

    expect(res.locals.notification).toEqual({
      content: '<h1>hello, world</h1>',
      id: 1,
      revision: 2,
    })
  })

  it('should log error and continue', async () => {
    const error = new Error('api error')
    contentfulService.getMostRecentNotificationAsHtml.mockRejectedValue(error)

    await notificationHandler(req, res, next)

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Error loading contentful content')
    expect(next).toHaveBeenCalled()
  })
})
