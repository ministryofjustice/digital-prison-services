import asyncMiddleware from '../middleware/asyncHandler'

export const userMeFactory = (hmppsManageUsersApi) => {
  const userMe = asyncMiddleware(async (req, res) => {
    const data = await hmppsManageUsersApi.currentUser(res.locals)
    res.json(data)
  })

  const userRoles = asyncMiddleware(async (req, res) => {
    const data = hmppsManageUsersApi.userRoles(res.locals)
    res.json(data.map((role) => role.roleCode))
  })

  return {
    userMe,
    userRoles,
  }
}

export default {
  userMeFactory,
}
