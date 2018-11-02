const contextProperties = require('../contextProperties')

const addAuthorizationHeader = (context, config) => {
  const accessToken = contextProperties.getAccessToken(context)
  if (accessToken) {
    return {
      ...config,
      headers: {
        ...config.headers,
        authorization: `Bearer ${accessToken}`,
      },
    }
  }
  return config
}

const addPaginationHeaders = (context, config) => {
  const paginationHeaders = contextProperties.getRequestPagination(context)
  return {
    ...config,
    headers: {
      ...config.headers,
      ...paginationHeaders,
    },
  }
}

module.exports = {
  addAuthorizationHeader,
  addPaginationHeaders,
}
