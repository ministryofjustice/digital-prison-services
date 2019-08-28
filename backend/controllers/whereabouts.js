const moment = require('moment')
const { merge, switchDateFormat, getCurrentShift } = require('../utils')

const getReasonCountMap = (data, reasons) => {
  const filterAttendance = reason =>
    data.filter(
      attendance =>
        attendance && attendance.absentReason && attendance.absentReason.toLowerCase() === reason.toLowerCase()
    ).length

  return Object.values(reasons)
    .map(absentReason => ({
      [absentReason.toLowerCase()]: filterAttendance(absentReason),
    }))
    .reduce(merge, {})
}

const whereaboutsDashboardFactory = (oauthApi, elite2Api, whereaboutsApi, logerrror) => {
  const getDashboardStats = async (context, { agencyId, period, date, absenceReasons }) => {
    const [attendances, scheduledActivities] = await Promise.all([
      whereaboutsApi.getPrisonAttendance(context, { agencyId, period, date }),
      elite2Api.getOffenderActivities(context, { agencyId, period, date }),
    ])

    const attended = attendances.filter(attendance => attendance && attendance.attended).length
    const attendedBookings = attendances.map(activity => activity.bookingId)
    const missing = scheduledActivities.filter(activity => !attendedBookings.includes(activity.bookingId)).length
    const mergedAbsentReasons = Object.values(absenceReasons).reduce((a, b) => a.concat(b), [])

    return {
      attended,
      missing,
      ...getReasonCountMap(attendances, mergedAbsentReasons),
    }
  }

  const whereaboutsDashboard = async (req, res) => {
    const { agencyId, period, date } = req.query || {}

    try {
      const [user, caseloads, roles, absenceReasons] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
        whereaboutsApi.getAbsenceReasons(res.locals),
      ])

      const activeCaseLoad = caseloads.find(cl => cl.currentlyActive)
      const inactiveCaseLoads = caseloads.filter(cl => cl.currentlyActive === false)
      const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

      const formattedDate = switchDateFormat(date, 'DD-MM-YYYY')

      if (!period || !date) {
        const currentPeriod = getCurrentShift(moment().format())
        const today = moment().format('DD-MM-YYYY')
        res.redirect(`/whereabouts?agencyId=${activeCaseLoadId}&period=${currentPeriod}&date=${today}`)
        return
      }

      const dashboardStats = await getDashboardStats(res.locals, {
        agencyId,
        date: formattedDate,
        period,
        absenceReasons,
      })

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
        caseLoadId: activeCaseLoad.caseLoadId,
        allCaseloads: caseloads,
        inactiveCaseLoads,
        userRoles: roles,
        dashboardStats,
        date,
        period,
      })
    } catch (error) {
      logerrror('/whereabouts', error, 'There has been an error')
      res.render('error.njk', {
        title: 'Whereabouts Dashboard',
        message: 'There has been an error',
      })
    }
  }

  return {
    whereaboutsDashboard,
    getDashboardStats,
  }
}

module.exports = { whereaboutsDashboardFactory }
