// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')

const contentfulServiceFactory = require('../services/contentfulService')

const contentfulPages = {
  items: [
    {
      fields: {
        title: 'Features',
        body: {
          data: {},
          content: [
            {
              data: { uri: '//url.com' },
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Link example',
                  nodeType: 'text',
                },
              ],
              nodeType: 'hyperlink',
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Heading 2',
                  nodeType: 'text',
                },
              ],
              nodeType: 'heading-2',
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Heading 3',
                  nodeType: 'text',
                },
              ],
              nodeType: 'heading-3',
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Paragraph',
                  nodeType: 'text',
                },
              ],
              nodeType: 'paragraph',
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value: 'Normal list item',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'list-item',
                },
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [{ type: 'bold' }],
                      value: 'Bold list item',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'list-item',
                },
              ],
              nodeType: 'unordered-list',
            },
          ],
          nodeType: 'document',
        },
      },
    },
  ],
}

const contentfulNotification = (expiryTime) => ({
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

describe('Contentful service', () => {
  const notificationCookie = {}
  const contentfulClient = {}
  const req = {}
  let contentFulService

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'alreadyDismissed' does not exist on type... Remove this comment to see the full error message
    notificationCookie.alreadyDismissed = jest.fn()
    contentFulService = contentfulServiceFactory({ contentfulClient, notificationCookie })
  })

  describe('Pages', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEntries' does not exist on type '{}'.
      contentfulClient.getEntries = jest.fn().mockResolvedValue(contentfulPages)
    })

    it('should call getEntries with the correct path', async () => {
      await contentFulService.getPagesAsHtml('/features')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEntries' does not exist on type '{}'.
      expect(contentfulClient.getEntries).toHaveBeenCalledWith({ content_type: 'pages', 'fields.path': '/features' })
    })

    it('should render the content page with the correctly formatted markup', async () => {
      const { content, title } = await contentFulService.getPagesAsHtml('/features')

      expect(title).toBe('Features')

      expect(content).toBe(
        '<a class="govuk-link" href="//url.com">Link example</a><h2 class="govuk-heading-m">Heading 2</h2><h3 class="govuk-heading-s">Heading 3</h3><p class="govuk-body">Paragraph</p><ul class="govuk-list govuk-list--bullet"><li>Normal list item</li><li><strong>Bold list item</strong></li></ul>'
      )
    })

    it('should handle no content', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEntries' does not exist on type '{}'.
      contentfulClient.getEntries = jest.fn().mockResolvedValue({ items: [] })
      const content = await contentFulService.getPagesAsHtml('/features')

      expect(content).toBeNull()
    })
  })

  describe('Notification bar', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEntries' does not exist on type '{}'.
      contentfulClient.getEntries = jest.fn().mockResolvedValue(contentfulNotification())
    })

    it('should call the contenful client with the correct parameters', async () => {
      await contentFulService.getMostRecentNotificationAsHtml(req)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEntries' does not exist on type '{}'.
      expect(contentfulClient.getEntries).toHaveBeenCalledWith({
        content_type: 'notification',
        order: '-sys.updatedAt',
      })
    })

    it('should render document and return notification content', async () => {
      const content = await contentFulService.getMostRecentNotificationAsHtml(req)

      expect(content.id).toBe(1)
      expect(content.revision).toBe(2)
      expect(content.content).toBe(
        `<p class="govuk-body">You can now view and print someone’s finance and transaction details using DPS - <a class="govuk-link" href="https://prisonstaffhub.service.hmpps.dsd.io/content/whats-new"></a><a class="govuk-link" href="https://whereabouts.prison.service.justice.gov.uk/content/whats-new">read the release notes to find out more</a></p>`
      )
    })

    it('should not render expired content', async () => {
      const expiryDate = moment().subtract(1, 'day').toISOString(false)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEntries' does not exist on type '{}'.
      contentfulClient.getEntries = jest.fn().mockResolvedValue(contentfulNotification(expiryDate))

      const content = await contentFulService.getMostRecentNotificationAsHtml(req)

      expect(content).toBeNull()
    })

    it('should not render if the notification has already been dismissed', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'alreadyDismissed' does not exist on type... Remove this comment to see the full error message
      notificationCookie.alreadyDismissed.mockReturnValue(true)
      const content = await contentFulService.getMostRecentNotificationAsHtml(req)

      expect(content).toBeNull()
    })

    it('should handle no content', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getEntries' does not exist on type '{}'.
      contentfulClient.getEntries = jest.fn().mockResolvedValue({ items: [] })
      const content = await contentFulService.getMostRecentNotificationAsHtml(req)

      expect(content).toBeNull()
    })
  })
})
