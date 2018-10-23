const contextProperties = require('../contextProperties')

const addAuthorizationHeader = (context, config) => {
  const accessToken = contextProperties.getAccessToken(context)
  if (accessToken) {
    config.headers = config.headers || {}
    config.headers.authorization = `Bearer ${accessToken}`
  }
  return config
}

const addPaginationHeaders = (context, config) => {
  const paginationHeaders = contextProperties.getRequestPagination(context)
  config.headers = config.headers || {}
  Object.assign(config.headers, paginationHeaders)
  return config
}

module.exports = {
  addAuthorizationHeader,
  addPaginationHeaders,
}
