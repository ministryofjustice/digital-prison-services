const errorHandlerFactory = require('../middleware/errorHandler')

const serverError = {
  ...new Error('error'),
  response: {
    status: 500,
  },
}

const notFoundError = {
  ...new Error('not found error'),
  response: {
    status: 404,
  },
}

const authError = {
  ...new Error('auth error'),
  response: {
    status: 401,
  },
}
describe('Error handler', () => {
  let req
  let res
  let errorHandler
  let logError

  beforeEach(() => {
    req = {
      headers: {},
      originalUrl: 'http://original',
    }
    res = {
      render: jest.fn(),
      status: jest.fn(),
      end: jest.fn(),
      locals: {
        redirectUrl: 'http://redirect',
        homeUrl: 'http://home',
      },
    }

    logError = jest.fn()
    errorHandler = errorHandlerFactory({ logError })
  })

  describe('Xhr type requests', () => {
    it('should set status and call end', async () => {
      req.xhr = true

      await errorHandler(authError, req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.end).toHaveBeenCalled()
    })
  })

  describe('Server side 5xxx errors', () => {
    it('should log error', async () => {
      await errorHandler(serverError, req, res)

      expect(logError).toHaveBeenCalledWith('http://original', serverError, 'There was a problem loading page')
    })

    it('should set the correct status', async () => {
      await errorHandler(serverError, req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('should render error template, using redirect url', async () => {
      await errorHandler(serverError, req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', { homeUrl: 'http://home', url: 'http://redirect' })
    })

    it('should render error template, using original url', async () => {
      delete res.locals.redirectUrl

      await errorHandler(serverError, req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', { homeUrl: 'http://home', url: 'http://original' })
    })
  })

  describe('Not found errors', () => {
    it('should set the correct status', async () => {
      await errorHandler(notFoundError, req, res)
      expect(res.status).toHaveBeenCalledWith(404)
    })
    it('should set the correct status and render page not found template', async () => {
      await errorHandler(notFoundError, req, res)
      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/' })
    })
  })
})
