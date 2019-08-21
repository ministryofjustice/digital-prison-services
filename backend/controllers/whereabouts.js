const { switchDateFormat } = require('../utils')

const whereaboutsDashboardFactory = (oauthApi, elite2Api, whereaboutsApi) => {
  const whereaboutsDashboard = async (req, res) => {
    try {
      const [user, caseloads, roles, absenceReasons, prisonAttendance] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
        whereaboutsApi.getAbsenceReasons(res.locals),
        // whereaboutsApi.getPrisonAttendance(res.locals, params),
      ])

      // console.log('REASONS === ', prisonAttendance)

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
  }

  return {
    whereaboutsDashboard,
  }
}

module.exports = { whereaboutsDashboardFactory }
