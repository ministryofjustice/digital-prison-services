const contentfulClient = require('../contentfulClient')
const content = require('../controllers/content')

jest.mock('../contentfulClient', () => ({
  getEntries: jest.fn().mockReturnValue({ items: [] }),
}))

describe('content', () => {
  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: '/content-page',
      params: {},
    }
    res = {
      render: jest.fn(),
    }
    logError = jest.fn()

    controller = content({ logError })
  })

  describe('when no path is specified', () => {
    it('should render not found template', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: 'http://localhost:3000/' })
    })
  })

  describe('when there is a path specified', () => {
    beforeEach(() => {
      req.params.path = '/features'
    })

    it('should call getEntries with the correct path', async () => {
      await controller(req, res)

      expect(contentfulClient.getEntries).toHaveBeenCalledWith({ content_type: 'pages', 'fields.path': '/features' })
    })

    describe('when there is no page for the specfied path', () => {
      it('should render not found template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: 'http://localhost:3000/' })
      })
    })

    describe('when there is a page for the specified path', () => {
      beforeEach(() => {
        contentfulClient.getEntries = jest.fn().mockReturnValue({
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
        })
      })

      it('should render the content page with the correctly formatted markup', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('content.njk', {
          content:
            '<a class="govuk-link" href="//url.com">Link example</a><h2 class="govuk-heading-m">Heading 2</h2><h3 class="govuk-heading-s">Heading 3</h3><p class="govuk-body">Paragraph</p><ul class="govuk-list govuk-list--bullet"><li>Normal list item</li><li><strong>Bold list item</strong></li></ul>',
          dpsUrl: 'http://localhost:3000/',
          title: 'Features',
        })
      })
    })
  })
})
