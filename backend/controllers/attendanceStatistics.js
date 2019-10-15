const moment = require('moment')
const config = require('../config')
const {
  merge,
  capitalize,
  switchDateFormat,
  getCurrentPeriod,
  pascalToString,
  flagFuturePeriodSelected,
  readablePeriod,
  readableDateFormat,
  stripAgencyPrefix,
} = require('../utils')

const getReasonCountMap = (data, reasons) => {
  const countAttendancesForReason = reason =>
    data.filter(
      attendance =>
        attendance && attendance.absentReason && attendance.absentReason.toLowerCase() === reason.toLowerCase()
    ).length

  return Object.values(reasons)
    .map(absentReason => ({
      [absentReason]: countAttendancesForReason(absentReason),
    }))
    .reduce(merge, {})
}

const attendanceStatisticsFactory = (oauthApi, elite2Api, whereaboutsApi, logError) => {
  const getDashboardStats = async (context, { agencyId, period, date, absenceReasons }) => {
    const [getPrisonAttendance, scheduledActivities] = await Promise.all([
      whereaboutsApi.getPrisonAttendance(context, { agencyId, period, date }),
      elite2Api.getOffenderActivities(context, { agencyId, period, date }),
    ])
    const { attendances } = getPrisonAttendance

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
      const displayDate = readableDateFormat(date, 'DD/MM/YYYY')

      const currentPeriod = getCurrentPeriod(moment().format())
      const today = moment().format('DD/MM/YYYY')
      const isFuturePeriod = flagFuturePeriodSelected(date, period, currentPeriod)
      const periodString = readablePeriod(period)

      if (!period || !date) {
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
        formattedReasons[key] = values.map(reason => ({ value: reason, name: pascalToString(reason) }))
      })

      res.render('attendanceStatistics.njk', {
        title: 'Attendance reason statistics',
        displayDate,
        periodString,
        isFuturePeriod,
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
        url: '/manage-prisoner-whereabouts/attendance-reason-statistics',
      })
    }
  }

  const attendanceStatisticsOffendersList = async (req, res) => {
    const { reason } = req.params
    const { agencyId, period, date } = req.query || {}
    const formattedDate = switchDateFormat(date, 'DD/MM/YYYY')
    const currentPeriod = getCurrentPeriod(moment().format())
    const today = moment().format('DD/MM/YYYY')

    try {
      const [user, caseloads, roles] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])

      const activeCaseLoad = caseloads.find(cl => cl.currentlyActive)
      const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

      if (!period || !date) {
        res.redirect(
          `/manage-prisoner-whereabouts/attendance-reason-statistics/reason/${reason}?agencyId=${activeCaseLoadId}&period=${currentPeriod}&date=${today}`
        )
        return
      }

      const [absentOffenders, activities] = await Promise.all([
        whereaboutsApi.getAbsences(res.locals, {
          agencyId,
          date: formattedDate,
          period,
        }),
        elite2Api.getOffenderActivities(res.locals, { agencyId, period, date: formattedDate }),
      ])
      const { attendances } = absentOffenders
      const absences = attendances.filter(absence => absence.absentReason === reason)

      const offenderData = absences.map(absence => {
        const offenderActivity = activities.find(activity => activity.bookingId === absence.bookingId)
        return {
          offenderName: `${capitalize(offenderActivity.lastName)}, ${capitalize(offenderActivity.firstName)}`,
          offenderNo: offenderActivity.offenderNo,
          location: stripAgencyPrefix(offenderActivity.cellLocation, agencyId),
          activity: offenderActivity.comment,
          comments: absence.comments,
        }
      })

      const offenders = offenderData
        .sort((a, b) => a.offenderName.localeCompare(b.offenderName, 'en', { ignorePunctuation: true }))
        .map(data => {
          const quickLookUrl = `${config.app.notmEndpointUrl}offenders/${data.offenderNo}/quick-look`

          // Return the data in the appropriate format to seed the table macro
          return [
            {
              html: `<a href=${quickLookUrl} target="_blank">${data.offenderName}</a>`,
            },
            {
              text: data.offenderNo,
            },
            {
              text: data.location,
            },
            {
              text: data.activity,
            },
            {
              text: data.comments,
            },
          ]
        })

      const displayReason = pascalToString(reason)
      const displayDate = readableDateFormat(date, 'DD/MM/YYYY')

      const sortOptions = [
        { value: '0_ascending', text: 'Name (A-Z)' },
        { value: '0_descending', text: 'Name (Z-A)' },
        { value: '2_ascending', text: 'Location (A-Z)' },
        { value: '2_descending', text: 'Location (Z-A)' },
        { value: '3_ascending', text: 'Activity (A-Z)' },
        { value: '3_descending', text: 'Activity (Z-A)' },
      ]

      res.render('attendanceStatisticsOffendersList.njk', {
        title: `${displayReason} - ${displayDate}`,
        reason: displayReason,
        dashboardUrl: `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&date=${date}`,
        offenders,
        sortOptions,
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad.description,
            id: activeCaseLoadId,
          },
        },
        caseLoadId: activeCaseLoad.caseLoadId,
        allCaseloads: caseloads,
        userRoles: roles,
      })
    } catch (error) {
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')
      res.render('error.njk', {
        url: `/manage-prisoner-whereabouts/attendance-reason-statistics/reason/${reason}`,
      })
    }
  }

  return {
    attendanceStatistics,
    getDashboardStats,
    attendanceStatisticsOffendersList,
  }
}

module.exports = { attendanceStatisticsFactory }
