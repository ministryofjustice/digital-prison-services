const contextProperties = require('../contextProperties')

const getHeaders = (context, resultsLimit) => {
  const paginationHeaders = contextProperties.getRequestPagination(context)
  const customHeaders = contextProperties.getCustomRequestHeaders(context)
  const accessToken = contextProperties.getAccessToken(context)

  return {
    ...customHeaders,
    ...paginationHeaders,
    ...(resultsLimit && { 'page-limit': resultsLimit.toString() }),
    ...(accessToken && { authorization: `Bearer ${accessToken}` }),
  }
}

module.exports = {
  getHeaders,
}
