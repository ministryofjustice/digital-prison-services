import content from '../controllers/content'

describe('content', () => {
  let req
  let res
  let logError
  let controller
  const contentfulService = {}

  beforeEach(() => {
    req = {
      originalUrl: '/content-page',
      params: {},
    }
    res = {
      render: jest.fn(),
    }
    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPagesAsHtml' does not exist on type '... Remove this comment to see the full error message
    contentfulService.getPagesAsHtml = jest.fn()
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ logError: any; contentfulServi... Remove this comment to see the full error message
    controller = content({ logError, contentfulService })
  })

  describe('when no path is specified', () => {
    it('should render not found template', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/' })
    })
  })

  describe('when there is a path specified', () => {
    beforeEach(() => {
      req.params.path = '/features'
    })

    it('should call getPagesAsHtml with the correct path', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPagesAsHtml' does not exist on type '... Remove this comment to see the full error message
      expect(contentfulService.getPagesAsHtml).toHaveBeenCalledWith('/features')
    })

    describe('when there is no page for the specfied path', () => {
      it('should render not found template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/' })
      })
    })

    it('should render the content page with the correctly formatted markup', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPagesAsHtml' does not exist on type '... Remove this comment to see the full error message
      contentfulService.getPagesAsHtml = jest.fn().mockResolvedValue({
        content: '<h1>hello,world</h1>',
        title: 'Features',
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('content.njk', {
        content: '<h1>hello,world</h1>',
        title: 'Features',
      })
    })
  })
})
