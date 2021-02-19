const moment = require('moment')

const notificationHandlerFactory = require('./notificationHandler')

const contentfulDocument = expiryTime => ({
  total: 1,
  items: [
    {
      sys: {
        id: 1,
        revision: 2,
      },
      fields: {
        title: 'New release',
        expiryTime,
        body: {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'You can now view and print someone’s finance and transaction details using DPS - ',
                  nodeType: 'text',
                },
                {
                  data: {
                    uri: 'https://prisonstaffhub.service.hmpps.dsd.io/content/whats-new',
                  },
                  content: [
                    {
                      data: {},
                      marks: [],
                      value: '',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'hyperlink',
                },
                {
                  data: {},
                  marks: [],
                  value: '',
                  nodeType: 'text',
                },
                {
                  data: {
                    uri: 'https://whereabouts.prison.service.justice.gov.uk/content/whats-new',
                  },
                  content: [
                    {
                      data: {},
                      marks: [],
                      value: 'read the release notes to find out more',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'hyperlink',
                },
                {
                  data: {},
                  marks: [],
                  value: '',
                  nodeType: 'text',
                },
              ],
              nodeType: 'paragraph',
            },
          ],
          nodeType: 'document',
        },
      },
    },
  ],
})

describe('Notification handler', () => {
  const contentfulClient = {}
  const notificationCookie = {}
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
    contentfulClient.getEntries = jest.fn().mockResolvedValue(contentfulDocument())
    notificationCookie.alreadyDismissed = jest.fn()
    notificationHandler = notificationHandlerFactory({ contentfulClient, notificationCookie, logError })
  })

  it('should call the contenful client with the correct parameters', async () => {
    await notificationHandler(req, res, next)

    expect(contentfulClient.getEntries).toHaveBeenCalledWith({
      content_type: 'notification',
      order: '-sys.updatedAt',
    })
  })

  it('should render document and place the results into res locals', async () => {
    await notificationHandler(req, res, next)

    expect(res.locals.notification.id).toBe(1)
    expect(res.locals.notification.revision).toBe(2)
    expect(res.locals.notification.content)
      .toBe(`<p>You can now view and print someone’s finance and transaction details using DPS - <a class="link" href="https://prisonstaffhub.service.hmpps.dsd.io/content/whats-new">
        
      </a><a class="link" href="https://whereabouts.prison.service.justice.gov.uk/content/whats-new">
        read the release notes to find out more
      </a></p>`)
  })

  it('should not render expired content', async () => {
    const expiryDate = moment()
      .subtract(1, 'day')
      .toISOString(false)

    contentfulClient.getEntries = jest.fn().mockResolvedValue(contentfulDocument(expiryDate))

    await notificationHandler(req, res, next)

    expect(res.locals.notification).toBe(undefined)
  })

  it('should not render if the notification has already been dismissed', async () => {
    notificationCookie.alreadyDismissed.mockReturnValue(true)
    await notificationHandler(req, res, next)

    expect(res.locals.notification).toBe(undefined)
  })

  it('should log error and continue', async () => {
    const error = new Error('api error')
    contentfulClient.getEntries.mockRejectedValue(error)

    await notificationHandler(req, res, next)

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Error loading contentful content')
    expect(next).toHaveBeenCalled()
  })
})
