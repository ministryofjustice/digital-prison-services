const asyncMiddleware = require('../middleware/asyncHandler')

const userMeFactory = elite2Api => {
  const userMe = asyncMiddleware(async (req, res) => {
    const data = await elite2Api.currentUser(res.locals)
    res.json(data)
  })

  const userRoles = asyncMiddleware(async (req, res) => {
    const data = await elite2Api.userRoles(res.locals)
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
