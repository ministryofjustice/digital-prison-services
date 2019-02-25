const asyncMiddleware = require('../middleware/asyncHandler')

const userMeFactory = oauthApi => {
  const userMe = asyncMiddleware(async (req, res) => {
    const data = await oauthApi.currentUser(res.locals)
    res.json(data)
  })

  const userRoles = asyncMiddleware(async (req, res) => {
    const data = await oauthApi.userRoles(res.locals)
    res.json(data.map(role => role.roleCode))
  })

  return {
    userMe,
    userRoles,
  }
}

module.exports = {
  userMeFactory,
}
