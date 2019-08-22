const asyncMiddleware = require('../middleware/asyncHandler')
// const { switchDateFormat } = require('../utils')

const whereaboutsDashboardFactory = (oauthApi, elite2Api, whereaboutsApi) => {
  const whereaboutsDashboard = asyncMiddleware(async (req, res) => {
    console.log('=====', req.query)

    const { agencyId, period, date } = req.query
    // const formattedDate = switchDateFormat(date)
    const params = {
      agencyId,
      date,
      period,
    }
    try {
      const [user, caseloads, roles, absenceReasons, activities, prisonAttendance] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
        whereaboutsApi.getAbsenceReasons(res.locals),
        elite2Api.getOffenderActivities(res.locals, params),
        whereaboutsApi.getPrisonAttendance(res.locals, params),
      ])

      console.log({ activities })

      const activeCaseLoad = caseloads.find(cl => cl.currentlyActive)
      const inactiveCaseLoads = caseloads.filter(cl => cl.currentlyActive === false)
      const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

      res.render('whereabouts.njk', {
        title: 'Whereabouts Dashboard',
        absenceReasons,
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad.description,
            id: activeCaseLoadId,
          },
        },
        allCaseloads: caseloads,
        inactiveCaseLoads,
        userRoles: roles,
      })
    } catch (error) {
      res.render('error.njk', {
        title: 'Whereabouts Dashboard',
        message: error.message,
      })
    }
  })

  return {
    whereaboutsDashboard,
  }
}

module.exports = { whereaboutsDashboardFactory }
