const contextProperties = require('../contextProperties')

const getHeaders = (context, resultsLimit) => {
  const paginationHeaders = contextProperties.getRequestPagination(context)

  const paginationHeadersWithResultsLimit = resultsLimit
    ? { ...paginationHeaders, 'page-limit': resultsLimit.toString() }
    : paginationHeaders

  const accessToken = contextProperties.getAccessToken(context)
  return accessToken
    ? { authorization: `Bearer ${accessToken}`, ...paginationHeadersWithResultsLimit }
    : paginationHeadersWithResultsLimit
}

module.exports = {
  getHeaders,
}
