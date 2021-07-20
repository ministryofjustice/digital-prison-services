// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'asyncMiddl... Remove this comment to see the full error message
const asyncMiddleware = require('../middleware/asyncHandler')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userMeFact... Remove this comment to see the full error message
const userMeFactory = (oauthApi) => {
  const userMe = asyncMiddleware(async (req, res) => {
    const data = await oauthApi.currentUser(res.locals)
    res.json(data)
  })

  const userRoles = asyncMiddleware(async (req, res) => {
    const data = await oauthApi.userRoles(res.locals)
    res.json(data.map((role) => role.roleCode))
  })

  return {
    userMe,
    userRoles,
  }
}

module.exports = {
  userMeFactory,
}
