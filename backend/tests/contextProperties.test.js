/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const contextProperties = require('../contextProperties')

describe('Should read/write properties', () => {
  describe('Should set / get tokens', () => {
    const context = {}
    contextProperties.setTokens({ access_token: 'a', refresh_token: 'b', authSource: 'joe' }, context)

    it('should set the access token', () => {
      expect(contextProperties.getAccessToken(context)).to.be.equal('a')
    })
    it('should set the refresh token', () => {
      expect(contextProperties.getRefreshToken(context)).to.be.equal('b')
    })
    it('should set the auth source', () => {
      expect(context.authSource).to.be.equal('joe')
    })
  })

  describe('Should return null if tokens not present', () => {
    const context = {}

    it('access token', () => {
      expect(contextProperties.getAccessToken(context)).to.be.null
    })
    it('refresh token', () => {
      expect(contextProperties.getRefreshToken(context)).to.be.null
    })
  })

  describe('Should know if the context has no tokens', () => {
    it('null', () => {
      expect(contextProperties.hasTokens(null)).to.be.false
    })
    it('undefined', () => {
      expect(contextProperties.hasTokens(undefined)).to.be.false
    })
    it('empty object', () => {
      expect(contextProperties.hasTokens({})).to.be.false
    })
  })

  describe('Should know if the context has tokens', () => {
    const context = {}

    it('no tokens', () => {
      contextProperties.setTokens({}, context)
      expect(contextProperties.hasTokens(context)).to.be.false
    })
    it('empty tokens', () => {
      contextProperties.setTokens({ access_token: '', refresh_token: '' }, context)
      expect(contextProperties.hasTokens(context)).to.be.false
    })
    it('only access token', () => {
      contextProperties.setTokens({ access_token: 'a', refresh_token: '' }, context)
      expect(contextProperties.hasTokens(context)).to.be.false
    })
    it('only refresh tokenb', () => {
      contextProperties.setTokens({ access_token: '', refresh_token: 'b' }, context)
      expect(contextProperties.hasTokens(context)).to.be.false
    })
    it('both tokens', () => {
      contextProperties.setTokens({ access_token: 'a', refresh_token: 'b' }, context)
      expect(contextProperties.hasTokens(context)).to.be.true
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
      expect(contextProperties.getResponsePagination(context)).to.deep.equal({
        'page-offset': 1,
        'page-limit': 10,
        'sort-fields': 'a,b',
        'sort-order': 'ASC',
        'total-records': 100,
      })
    })

    it('Should return an empty responsePagination object if no values were set', () => {
      contextProperties.setResponsePagination(context, {})
      expect(contextProperties.getResponsePagination(context)).to.deep.equal({})
    })

    it('Should return an empty responsePagination object even when the setter has not been called', () => {
      expect(contextProperties.getResponsePagination(context)).to.deep.equal({})
    })
  })

  describe('Should handle custom headers', () => {
    const context = {}

    it('Should set custom headers', () => {
      contextProperties.setCustomRequestHeaders(context, {
        Header1: 1,
        HEADER2: 'value2',
      })
      expect(contextProperties.getCustomRequestHeaders(context)).to.deep.equal({
        header1: 1,
        header2: 'value2',
      })
    })

    it('Should return an empty custom headers object if no values were set', () => {
      contextProperties.setCustomRequestHeaders(context, {})
      expect(contextProperties.getCustomRequestHeaders(context)).to.deep.equal({})
    })

    it('Should return an empty custom headers object even when the setter has not been called', () => {
      expect(contextProperties.getCustomRequestHeaders({})).to.deep.equal({})
    })
  })

  describe('Should handle pagination for page requests', () => {
    const context = {}

    it('Should set the response pagination properties', () => {
      contextProperties.setPaginationFromPageRequest(context, {
        pageable: { pageSize: 10, offset: 1 },
        totalElements: 100,
      })
      expect(contextProperties.getResponsePagination(context)).to.deep.equal({
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
      expect(contextProperties.getPaginationForPageRequest(context)).to.deep.equal({
        page: 2,
        size: 10,
      })
    })
  })
})
