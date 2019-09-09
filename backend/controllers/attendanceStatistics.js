const moment = require('moment')
const { merge, switchDateFormat, getCurrentShift, pascalToString } = require('../utils')

const getReasonCountMap = (data, reasons) => {
  const countAttendancesForReason = reason =>
    data.filter(
      attendance =>
        attendance && attendance.absentReason && attendance.absentReason.toLowerCase() === reason.toLowerCase()
    ).length

  return Object.values(reasons)
    .map(absentReason => ({
      [absentReason.toLowerCase()]: countAttendancesForReason(absentReason),
    }))
    .reduce(merge, {})
}

const attendanceStatisticsFactory = (oauthApi, elite2Api, whereaboutsApi, logError) => {
  const getDashboardStats = async (context, { agencyId, period, date, absenceReasons }) => {
    const [attendances, scheduledActivities] = await Promise.all([
      whereaboutsApi.getPrisonAttendance(context, { agencyId, period, date }),
      elite2Api.getOffenderActivities(context, { agencyId, period, date }),
    ])

    const attended = attendances.filter(attendance => attendance && attendance.attended).length
    const attendedBookings = attendances.map(activity => activity.bookingId)
    const unaccountedFor = scheduledActivities.filter(activity => !attendedBookings.includes(activity.bookingId)).length
    const mergedAbsentReasons = Object.values(absenceReasons).reduce((a, b) => a.concat(b), [])

    return {
      attended,
      unaccountedFor,
      ...getReasonCountMap(attendances, mergedAbsentReasons),
    }
  }

  const attendanceStatistics = async (req, res) => {
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

      const formattedDate = switchDateFormat(date, 'DD/MM/YYYY')

      if (!period || !date) {
        const currentPeriod = getCurrentShift(moment().format())
        const today = moment().format('DD/MM/YYYY')
        res.redirect(
          `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${activeCaseLoadId}&period=${currentPeriod}&date=${today}`
        )
        return
      }

      const dashboardStats = await getDashboardStats(res.locals, {
        agencyId,
        date: formattedDate,
        period,
        absenceReasons,
      })

      const formattedReasons = {}
      Object.entries(absenceReasons).forEach(([key, values]) => {
        formattedReasons[key] = values.map(reason => ({ [reason.toLowerCase()]: pascalToString(reason) }))
      })

      res.render('attendanceStatistics.njk', {
        title: 'Attendance reason statistics',
        formattedReasons,
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
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')
      res.render('error.njk', {
        title: 'Attendance reason statistics',
        url: '/manage-prisoner-whereabouts/attendance-reason-statistics',
      })
    }
  }

  return {
    attendanceStatistics,
    getDashboardStats,
  }
}

module.exports = { attendanceStatisticsFactory }
