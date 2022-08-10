/**
 * Wrapper functions to set commonly used fields on an 'context' object that is managed over the scope of a request.
 * Hopefully reduces the liklihood of mis-typing property names.
 * Note that by convention the controller(s) and Middleware use the res.locals property as the request scoped context.
 * From controllers down to clients, client interceptors etc the context object is called 'context'.
 */

// eslint-disable-next-line camelcase
export const setTokens = ({ access_token, refresh_token, authSource = undefined }, context) => {
  // eslint-disable-next-line no-param-reassign,camelcase
  context.access_token = access_token
  // eslint-disable-next-line no-param-reassign,camelcase
  context.refresh_token = refresh_token
  // eslint-disable-next-line no-param-reassign
  context.authSource = authSource
}

export const hasTokens = (context) => Boolean(context && context.access_token && context.refresh_token)

export const getAccessToken = (context) => (context && context.access_token ? context.access_token : null)

export const getRefreshToken = (context) => (context && context.refresh_token ? context.refresh_token : null)

export const normalizeHeaderNames = (srcHeaders) =>
  Object.keys(srcHeaders).reduce(
    (previous, headerName) => ({
      ...previous,
      [headerName.toLowerCase()]: srcHeaders[headerName],
    }),
    {}
  )

export const copyNamedHeaders = (headerNames, srcHeaders) =>
  headerNames.reduce((previous, name) => {
    if (srcHeaders[name]) {
      return {
        ...previous,
        [name]: srcHeaders[name],
      }
    }
    return previous
  }, {})

export const setRequestPagination = (context, headers) => {
  const headerNames = ['page-offset', 'page-limit', 'sort-fields', 'sort-order']
  // eslint-disable-next-line no-param-reassign
  context.requestHeaders = copyNamedHeaders(headerNames, (headers && normalizeHeaderNames(headers)) || {})
}

export const getRequestPagination = (context) => context.requestHeaders || {}

export const setResponsePagination = (context, headers) => {
  const headerNames = ['page-offset', 'page-limit', 'sort-fields', 'sort-order', 'total-records']

  // eslint-disable-next-line no-param-reassign
  context.responseHeaders = copyNamedHeaders(headerNames, (headers && normalizeHeaderNames(headers)) || {})
}

interface PaginationHeaders {
  'page-offset'?: number
  'page-limit'?: number
  'sort-fields'?: string
  'sort-order'?: string
}

export const getPaginationForPageRequest = (
  {
    requestHeaders,
  }: {
    requestHeaders: PaginationHeaders
  },
  fieldMapper: (fieldName: string) => string = (fieldName) => fieldName
): { page: number; size: number; sort?: string } => {
  if (!requestHeaders) return { page: 0, size: 20 }

  const pageOffset = requestHeaders['page-offset']
  const size: number = requestHeaders['page-limit'] || 20
  const page = Math.floor(pageOffset / size) || 0
  const sortFields = requestHeaders['sort-fields']
  const sortOrder = requestHeaders['sort-order'] ?? 'ASC'
  const sortFieldsMapped = sortFields && sortFields.split(',').map(fieldMapper).join(',')
  const sort = sortFieldsMapped && `${sortFieldsMapped},${sortOrder}`

  return { page, size, sort }
}

export const setPaginationFromPageRequest = (context, { totalElements, pageable: { pageSize, offset } }) => {
  const c = context
  c.responseHeaders = { 'page-offset': offset, 'page-limit': pageSize, 'total-records': totalElements }
}

export const getResponsePagination = (context) => context.responseHeaders || {}

export const setCustomRequestHeaders = (context, headers) => {
  // eslint-disable-next-line no-param-reassign
  context.customRequestHeaders = (headers && normalizeHeaderNames(headers)) || {}
}

export const getCustomRequestHeaders = (context) => context.customRequestHeaders || {}

export default {
  setTokens,
  hasTokens,
  getAccessToken,
  getRefreshToken,
  setRequestPagination,
  getRequestPagination,
  setResponsePagination,
  getResponsePagination,
  setCustomRequestHeaders,
  getCustomRequestHeaders,
  getPaginationForPageRequest,
  setPaginationFromPageRequest,
}
