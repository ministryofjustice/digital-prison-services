module.exports =
  (oauthApi, permittedRoles = []) =>
  async (req, res, next) => {
    const userRoles = await oauthApi.userRoles(res.locals)
    const roleCodes = userRoles.map((userRole) => userRole.roleCode)

    if (permittedRoles.some((role) => roleCodes.includes(role))) {
      next()
    } else {
      const error = {
        response: { status: 403 },
        error: new Error('User does not have the correct roles for this page'),
      }

      throw error
    }
  }
