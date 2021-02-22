const content = require('../controllers/content')

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

    contentfulService.getPagesAsHtml = jest.fn()
    controller = content({ logError, contentfulService })
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

    it('should call getPagesAsHtml with the correct path', async () => {
      await controller(req, res)

      expect(contentfulService.getPagesAsHtml).toHaveBeenCalledWith('/features')
    })

    describe('when there is no page for the specfied path', () => {
      it('should render not found template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: 'http://localhost:3000/' })
      })
    })

    it('should render the content page with the correctly formatted markup', async () => {
      contentfulService.getPagesAsHtml = jest.fn().mockResolvedValue({
        content: '<h1>hello,world</h1>',
        dpsUrl: 'http://localhost:3000/',
        title: 'Features',
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('content.njk', {
        content: '<h1>hello,world</h1>',
        dpsUrl: 'http://localhost:3000/',
        title: 'Features',
      })
    })
  })
})
