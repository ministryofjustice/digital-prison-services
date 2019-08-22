// const { switchDateFormat } = require('../utils')

const whereaboutsDashboardFactory = (oauthApi, elite2Api, whereaboutsApi) => {
  const service = async ({ agencyId, period, date }) => {
    const data = await whereaboutsApi.getPrisonAttendance(res.locals, params)
    const attended = data.filter(attendance => attendance.attended === true).length
    const notRequired = data.filter(nr => nr.absentReason === 'NotRequired').length
    const acceptableAbsence = data.filter(aa => aa.absentReason === 'AcceptableAbsence').length
    const approvedCourse = data.filter(ac => ac.absentReason === 'ApprovedCourse').length

    return {
      attended,
      notRequired,
      acceptableAbsence,
      approvedCourse,
    }
  }
  const whereaboutsDashboard = async (req, res) => {
    console.log('=====', req.query)

    const { agencyId, period, date } = req.query
    // const formattedDate = switchDateFormat(date)
    const params = {
      agencyId,
      date,
      period,
    }
    try {
      const [user, caseloads, roles, absenceReasons, prisonAttendance] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
        whereaboutsApi.getAbsenceReasons(res.locals),
        whereaboutsApi.getPrisonAttendance(res.locals, params),
      ])

      const getAttendedPrisoners = prisonAttendance.filter(prisoner => prisoner.attended === true)

      console.log({ getAttendedPrisoners })

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
        attendedPrisoners: getAttendedPrisoners.length,
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
    service,
  }
}

module.exports = { whereaboutsDashboardFactory }
