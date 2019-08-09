const decorators = require('./axios-config-decorators')
const contextProperties = require('../contextProperties')

describe('Axios request configuration decorator tests', () => {
  it('should return paging and auth headers', () => {
    const context = {}
    contextProperties.setTokens({ access_token: 'access', refresh_token: 'refresh' }, context)
    contextProperties.setRequestPagination(context, { 'page-limit': 5 })

    const headers = decorators.getHeaders(context)
    expect(headers).toEqual({ authorization: 'Bearer access', 'page-limit': 5 })
  })

  it('should override page limit header', () => {
    const context = {}
    contextProperties.setTokens({ access_token: 'access', refresh_token: 'refresh' }, context)
    contextProperties.setRequestPagination(context, { 'page-limit': '5' })

    const headers = decorators.getHeaders(context, 500)
    expect(headers).toEqual({ authorization: 'Bearer access', 'page-limit': '500' })
  })

  it('should exclude authorization header if not required', () => {
    const context = {}
    contextProperties.setRequestPagination(context, { 'page-limit': '5' })

    const headers = decorators.getHeaders(context)
    expect(headers).toEqual({ 'page-limit': '5' })
  })
})
