import contextProperties from '../contextProperties'

export const hmppsManageUsersApiFactory = (client) => {
  const get = (context, path) => client.get(context, path).then((response) => response.body)

  const currentUser = (context) => get(context, '/users/me')
  const userEmail = (context, username) => get(context, `/users/${username}/email`)
  const userDetails = (context, username) => getWithHandle404(context, `/users/${username}`)

  const processResponse = (context) => (response) => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }

  const map404ToNull = (error) => {
    if (!error.response) throw error
    if (!error.response.status) throw error
    if (error.response.status !== 404) throw error
    return null
  }
  const getWithHandle404 = (context, url, resultsLimit?, retryOverride?) =>
    client.get(context, url, { resultsLimit, retryOverride }).then(processResponse(context)).catch(map404ToNull)

  return {
    currentUser,
    userEmail,
    userDetails,
  }
}

export default { hmppsManageUsersApiFactory }
