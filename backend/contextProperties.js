/**
 * Wrapper functions to set commonly used fields on an 'context' object that is managed over the scope of a request.
 * Hopefully reduces the liklihood of mis-typing property names.
 * Note that by convention the controller(s) and Middleware use the res.locals property as the request scoped context.
 * From controllers down to clients, client interceptors etc the context object is called 'context'.
 */

// eslint-disable-next-line camelcase
const setTokens = ({ access_token, refresh_token, authSource }, context) => {
  // eslint-disable-next-line no-param-reassign,camelcase
  context.access_token = access_token
  // eslint-disable-next-line no-param-reassign,camelcase
  context.refresh_token = refresh_token
  // eslint-disable-next-line no-param-reassign
  context.authSource = authSource
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
  // eslint-disable-next-line no-param-reassign
  context.requestHeaders = copyNamedHeaders(headerNames, (headers && normalizeHeaderNames(headers)) || {})
}

const getRequestPagination = context => context.requestHeaders || {}

const setResponsePagination = (context, headers) => {
  const headerNames = ['page-offset', 'page-limit', 'sort-fields', 'sort-order', 'total-records']

  // eslint-disable-next-line no-param-reassign
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
