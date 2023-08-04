export const hmppsManageUsersApiFactory = (client) => {
  const get = (context, path) => client.get(context, path).then((response) => response.body)

  const currentUser = (context) => get(context, '/users/me')
  const userEmail = (context, username) => get(context, `/users/${username}/email`)
  const userDetails = (context, username) => get(context, `/users/${username}`)

  return {
    currentUser,
    userEmail,
    userDetails,
  }
}

export default { hmppsManageUsersApiFactory }
