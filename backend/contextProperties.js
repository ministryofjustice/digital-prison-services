/**
 * Wrapper functions to set commonly used fields on an 'context' object that is managed over the scope of a request.
 * Hopefully reduces the liklihood of mis-typing property names.
 * Note that by convention the controller(s) and Middleware use the res.locals property as the request scoped context.
 * From controllers down to clients, client interceptors etc the context object is called 'context'.
 */
const setTokens = (context, accessToken, refreshToken) => {
  context.accessToken = accessToken
  context.refreshToken = refreshToken
}

const hasTokens = context => {
  if (!context) return false
  return !(!context.accessToken || !context.refreshToken)
}

const getAccessToken = context => {
  if (!context) return null
  if (!context.accessToken) return null
  return context.accessToken
}

const getRefreshToken = context => {
  if (!context) return null
  if (!context.refreshToken) return null
  return context.refreshToken
}

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
