/* eslint-disable no-unused-expressions */
const contextProperties = require('../contextProperties')

describe('Should read/write properties', () => {
  describe('Should set / get tokens', () => {
    const context = {}
    contextProperties.setTokens({ access_token: 'a', refresh_token: 'b', authSource: 'joe' }, context)

    it('should set the access token', () => {
      expect(contextProperties.getAccessToken(context)).toBe('a')
    })
    it('should set the refresh token', () => {
      expect(contextProperties.getRefreshToken(context)).toBe('b')
    })
    it('should set the auth source', () => {
      expect(context.authSource).toBe('joe')
    })
  })

  describe('Should return null if tokens not present', () => {
    const context = {}

    it('access token', () => {
      expect(contextProperties.getAccessToken(context)).toBeNull()
    })
    it('refresh token', () => {
      expect(contextProperties.getRefreshToken(context)).toBeNull()
    })
  })

  describe('Should know if the context has no tokens', () => {
    it('null', () => {
      expect(contextProperties.hasTokens(null)).toBe(false)
    })
    it('undefined', () => {
      expect(contextProperties.hasTokens(undefined)).toBe(false)
    })
    it('empty object', () => {
      expect(contextProperties.hasTokens({})).toBe(false)
    })
  })

  describe('Should know if the context has tokens', () => {
    const context = {}

    it('no tokens', () => {
      contextProperties.setTokens({}, context)
      expect(contextProperties.hasTokens(context)).toBe(false)
    })
    it('empty tokens', () => {
      contextProperties.setTokens({ access_token: '', refresh_token: '' }, context)
      expect(contextProperties.hasTokens(context)).toBe(false)
    })
    it('only access token', () => {
      contextProperties.setTokens({ access_token: 'a', refresh_token: '' }, context)
      expect(contextProperties.hasTokens(context)).toBe(false)
    })
    it('only refresh tokenb', () => {
      contextProperties.setTokens({ access_token: '', refresh_token: 'b' }, context)
      expect(contextProperties.hasTokens(context)).toBe(false)
    })
    it('both tokens', () => {
      contextProperties.setTokens({ access_token: 'a', refresh_token: 'b' }, context)
      expect(contextProperties.hasTokens(context)).toBe(true)
    })
  })

  describe('Should handle pagination properties', () => {
    const context = {}

    it('Should set the response pagination properties', () => {
      contextProperties.setResponsePagination(context, {
        'PAGE-offset': 1,
        'page-LIMIT': 10,
        'Sort-Fields': 'a,b',
        'sort-order': 'ASC',
        'total-records': 100,
      })
      expect(contextProperties.getResponsePagination(context)).toStrictEqual({
        'page-offset': 1,
        'page-limit': 10,
        'sort-fields': 'a,b',
        'sort-order': 'ASC',
        'total-records': 100,
      })
    })

    it('Should return an empty responsePagination object if no values were set', () => {
      contextProperties.setResponsePagination(context, {})
      expect(contextProperties.getResponsePagination(context)).toStrictEqual({})
    })

    it('Should return an empty responsePagination object even when the setter has not been called', () => {
      expect(contextProperties.getResponsePagination(context)).toStrictEqual({})
    })
  })

  describe('Should handle custom headers', () => {
    const context = {}

    it('Should set custom headers', () => {
      contextProperties.setCustomRequestHeaders(context, {
        Header1: 1,
        HEADER2: 'value2',
      })
      expect(contextProperties.getCustomRequestHeaders(context)).toStrictEqual({
        header1: 1,
        header2: 'value2',
      })
    })

    it('Should return an empty custom headers object if no values were set', () => {
      contextProperties.setCustomRequestHeaders(context, {})
      expect(contextProperties.getCustomRequestHeaders(context)).toStrictEqual({})
    })

    it('Should return an empty custom headers object even when the setter has not been called', () => {
      expect(contextProperties.getCustomRequestHeaders({})).toStrictEqual({})
    })
  })

  describe('Should handle pagination for page requests', () => {
    const context = {}

    it('Should set the response pagination properties', () => {
      contextProperties.setPaginationFromPageRequest(context, {
        pageable: { pageSize: 10, offset: 1 },
        totalElements: 100,
      })
      expect(contextProperties.getResponsePagination(context)).toStrictEqual({
        'page-offset': 1,
        'page-limit': 10,
        'total-records': 100,
      })
    })

    it('Should get the request header pagination properties', () => {
      context.requestHeaders = {
        'page-offset': 20,
        'page-limit': 10,
      }
      expect(contextProperties.getPaginationForPageRequest(context)).toStrictEqual({
        page: 2,
        size: 10,
      })
    })
  })
})
