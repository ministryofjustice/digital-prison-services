/**
 * Wrapper functions to set commonly used fields on an 'context' object that is managed over the scope of a request.
 * Hopefully reduces the liklihood of mis-typing property names.
 * Note that by convention the controller(s) and Middleware use the req.session property as the request scoped context.
 * From controllers down to clients, client interceptors etc the context object is called 'context'.
 */

/* eslint no-param-reassign: 2 */
const setTokens = (context, accessToken, refreshToken) => {
  context.access_token = accessToken
  context.refresh_token = refreshToken
}

const hasTokens = context => Boolean(context && context.access_token && context.refresh_token)

const getAccessToken = context => (context && context.access_token ? context.access_token : null)

const getRefreshToken = context => (context && context.refresh_token ? context.refresh_token : null)

const normalizeHeaderNames = srcHeaders =>
  Object.keys(srcHeaders).reduce(
    (previous, headerName) => ({
      ...previous,
      [headerName.toLowerCase()]: srcHeaders[headerName],
    }),
    {}
  )

const copyNamedHeaders = (headerNames, srcHeaders) =>
  headerNames.reduce((previous, name) => {
    if (srcHeaders[name]) {
      return {
        ...previous,
        [name]: srcHeaders[name],
      }
    }
    return previous
  }, {})

const setRequestPagination = (context, headers) => {
  const headerNames = ['page-offset', 'page-limit', 'sort-fields', 'sort-order']
  context.requestHeaders = copyNamedHeaders(headerNames, (headers && normalizeHeaderNames(headers)) || {})
}

const getRequestPagination = context => context.requestHeaders || {}

const setResponsePagination = (context, headers) => {
  const headerNames = ['page-offset', 'page-limit', 'sort-fields', 'sort-order', 'total-records']
  context.responseHeaders = copyNamedHeaders(headerNames, (headers && normalizeHeaderNames(headers)) || {})
}

const getResponsePagination = context => context.responseHeaders || {}

module.exports = {
  setTokens,
  hasTokens,
  getAccessToken,
  getRefreshToken,
  setRequestPagination,
  getRequestPagination,
  setResponsePagination,
  getResponsePagination,
}
