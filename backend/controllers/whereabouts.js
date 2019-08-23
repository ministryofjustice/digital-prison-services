const moment = require('moment')
const { merge, switchDateFormat, getCurrentShift } = require('../utils')

const mapToReasonsModel = (data, reasons) => {
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

const getCountsOfPaidReasons = attendances => {
  const attended = attendances.filter(attendance => attendance && attendance.attended === true).length
  const paidReasonCodes = ['notRequired', 'acceptableAbsence', 'approvedCourse']

  // console.error(attended)

  return {
    attended,
    ...mapToReasonsModel(attendances, paidReasonCodes),
  }
}

const getCountsOfNotPaidReasons = attendances => {
  const notPaidReasonCodes = ['sick', 'refused', 'sessionCancelled', 'unacceptableAbsence', 'restDay', 'restInCell']

  return mapToReasonsModel(attendances, notPaidReasonCodes)
}

const getCountOfMissing = (attendances, scheduledActivities) => {
  const attendedBookings = attendances.map(activity => activity.bookingId)
  const missing = scheduledActivities.filter(activity => !attendedBookings.includes(activity.bookingId)).length

  return {
    missing,
  }
}

const whereaboutsDashboardFactory = (oauthApi, elite2Api, whereaboutsApi) => {
  const getDashboardViewModel = async (context, { agencyId, period, date }) => {
    const attendances = await whereaboutsApi.getPrisonAttendance(context, { agencyId, period, date })
    const scheduledActivities = await elite2Api.getOffenderActivities(context, { agencyId, period, date })

    return {
      ...getCountsOfPaidReasons(attendances),
      ...getCountsOfNotPaidReasons(attendances),
      ...getCountOfMissing(attendances, scheduledActivities || []),
    }
  }

  const whereaboutsDashboard = async (req, res) => {
    // console.log('=====', req.query)
    const { agencyId, period, date } = req.query || {}

    const formattedDate = switchDateFormat(date, 'DD-MM-YYYY')

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

      if (!period || !date) {
        const currentPeriod = getCurrentShift(moment().format())
        const today = moment().format('DD-MM-YYYY')

        res.redirect(`/whereabouts?agencyId=${activeCaseLoadId}&period=${currentPeriod}&date=${today}`)

        return
      }

      const viewModel = await getDashboardViewModel(res.locals, { agencyId, date: formattedDate, period })

      // console.log('VIEW MODEL ====== ', viewModel)

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
        data: viewModel,
        date,
        period,
      })
    } catch (error) {
      // console.error(error)
      res.render('error.njk', {
        title: 'Whereabouts Dashboard',
        message: error.message,
      })
    }
  }

  return {
    whereaboutsDashboard,
    getDashboardViewModel,
  }
}

module.exports = { whereaboutsDashboardFactory }
