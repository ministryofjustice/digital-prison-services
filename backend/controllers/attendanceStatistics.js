const moment = require('moment')
const config = require('../config')

const {
  capitalize,
  capitalizeStart,
  switchDateFormat,
  getCurrentPeriod,
  pascalToString,
  flagFuturePeriodSelected,
  readableDateFormat,
  stripAgencyPrefix,
} = require('../utils')

const buildStatsViewModel = dashboardStats => {
  const mapReasons = reasons =>
    Object.keys(reasons).map(name => ({
      id: capitalizeStart(name),
      name: capitalize(pascalToString(name)),
      value: Number(reasons[name]),
    }))

  return {
    ...dashboardStats,
    attended: dashboardStats.paidReasons.attended,
    paidReasons: mapReasons(dashboardStats.paidReasons).filter(
      nvp => nvp.name && nvp.name.toLowerCase() !== 'attended'
    ),
    unpaidReasons: mapReasons(dashboardStats.unpaidReasons),
  }
}

const periodDisplayLookup = {
  AM: 'AM',
  PM: 'PM',
  ED: 'ED',
  AM_PM: 'AM + PM',
}

const extractCaseLoadInfo = caseloads => {
  const activeCaseLoad = caseloads.find(cl => cl.currentlyActive)
  const inactiveCaseLoads = caseloads.filter(cl => cl.currentlyActive === false)
  const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

  return {
    activeCaseLoad,
    inactiveCaseLoads,
    activeCaseLoadId,
  }
}

const absentReasonTableViewModel = offenderData => ({
  sortOptions: [
    { value: '0_ascending', text: 'Name (A-Z)' },
    { value: '0_descending', text: 'Name (Z-A)' },
    { value: '2_ascending', text: 'Location (A-Z)' },
    { value: '2_descending', text: 'Location (Z-A)' },
    { value: '3_ascending', text: 'Activity (A-Z)' },
    { value: '3_descending', text: 'Activity (Z-A)' },
  ],
  offenders: offenderData
    .sort((a, b) => a.offenderName.localeCompare(b.offenderName, 'en', { ignorePunctuation: true }))
    .map(data => {
      const quickLookUrl = `${config.app.notmEndpointUrl}offenders/${data.offenderNo}/quick-look`

      // Return the data in the appropriate format to seed the table macro
      return [
        {
          html: data.location ? `<a href=${quickLookUrl} target="_blank">${data.offenderName}</a>` : data.offenderName,
        },
        {
          text: data.offenderNo,
        },
        {
          text: data.location || '--',
        },
        {
          text: data.activity,
        },
        {
          text: data.comments,
        },
      ]
    }),
})

const renderErrorTemplate = ({ error, req, res, logError, url }) => {
  if (error.code === 'ECONNABORTED') {
    logError(req.originalUrl, error, 'Request has timed out')
    return res.render('error.njk', {
      url: req.originalUrl,
      title: 'Your request has timed out.',
    })
  }
  logError(req.originalUrl, error, 'Sorry, the service is unavailable')
  return res.render('error.njk', {
    url,
  })
}

const validateDates = ({ fromDate, toDate }) => {
  const errors = []

  if (moment(fromDate, 'DD/MM/YYYY', 'day').isAfter(moment(toDate, 'DD/MM/YYYY', 'day')))
    errors.push({ text: 'Select a date which is before the to date', href: '#fromDate' })

  const now = moment()

  if (moment(fromDate, 'DD/MM/YYYY', 'day').isAfter(now, 'day'))
    errors.push({ text: 'Select a date range that is not in the future', href: '#fromDate' })

  if (moment(toDate, 'DD/MM/YYYY', 'day').isAfter(now, 'day'))
    errors.push({ text: 'Select a date range that is not in the future', href: '#toDate' })

  return errors
}

const attendanceStatisticsFactory = (oauthApi, elite2Api, whereaboutsApi, logError) => {
  const attendanceStatistics = async (req, res) => {
    const { agencyId, period, fromDate, toDate } = req.query || {}

    try {
      const [user, caseloads, roles] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])

      const { activeCaseLoad, inactiveCaseLoads, activeCaseLoadId } = extractCaseLoadInfo(caseloads)
      const currentPeriod = getCurrentPeriod(moment().format())
      const userViewModel = {
        displayName: user.name,
        activeCaseLoad: {
          description: activeCaseLoad.description,
          id: activeCaseLoadId,
        },
      }

      if (fromDate && toDate) {
        const errors = validateDates({ fromDate, toDate })

        if (errors.length > 0)
          return res.render('attendanceStatistics.njk', {
            title: 'Attendance reason statistics',
            errors,
            user: userViewModel,
            isFuturePeriod: flagFuturePeriodSelected(fromDate, period, currentPeriod),
            caseLoadId: activeCaseLoad.caseLoadId,
            allCaseloads: caseloads,
            inactiveCaseLoads,
            userRoles: roles,
            fromDate,
            toDate,
            displayPeriod: periodDisplayLookup[period],
            period,
          })
      }

      const fromDateValue = switchDateFormat(fromDate, 'DD/MM/YYYY')
      const toDateValue = switchDateFormat(toDate, 'DD/MM/YYYY')
      const fromDisplayDate = readableDateFormat(fromDate, 'DD/MM/YYYY')
      const toDisplayDate = readableDateFormat(toDate, 'DD/MM/YYYY')

      if (!period || !fromDate) {
        const today = moment().format('DD/MM/YYYY')
        return res.redirect(
          `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${activeCaseLoadId}&period=${currentPeriod}&fromDate=${today}&toDate=${today}`
        )
      }

      const dashboardStats = await whereaboutsApi.getAttendanceStats(res.locals, {
        agencyId,
        fromDate: fromDateValue,
        toDate: toDateValue,
        period: period === 'AM_PM' ? '' : period,
      })

      return res.render('attendanceStatistics.njk', {
        title: 'Attendance reason statistics',
        user: userViewModel,
        displayDate: `${fromDisplayDate} - ${toDisplayDate}`,
        isFuturePeriod: flagFuturePeriodSelected(fromDate, period, currentPeriod),
        dashboardStats: buildStatsViewModel(dashboardStats),
        caseLoadId: activeCaseLoad.caseLoadId,
        allCaseloads: caseloads,
        inactiveCaseLoads,
        userRoles: roles,
        fromDate,
        toDate,
        displayPeriod: periodDisplayLookup[period],
        period,
      })
    } catch (error) {
      return renderErrorTemplate({
        error,
        req,
        res,
        logError,
        url: '/manage-prisoner-whereabouts/attendance-reason-statistics',
      })
    }
  }

  const attendanceStatisticsOffendersList = async (req, res) => {
    const { reason } = req.params
    const { agencyId, period, fromDate, toDate } = req.query || {}

    const formattedFromDate = switchDateFormat(fromDate, 'DD/MM/YYYY')
    const formattedToDate = switchDateFormat(toDate, 'DD/MM/YYYY')
    const currentPeriod = getCurrentPeriod(moment().format())
    const today = moment().format('DD/MM/YYYY')

    try {
      const [user, caseloads, roles] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])

      const { activeCaseLoad, activeCaseLoadId } = extractCaseLoadInfo(caseloads)

      if (!period || !fromDate) {
        return res.redirect(
          `/manage-prisoner-whereabouts/attendance-reason-statistics/reason/${reason}?agencyId=${activeCaseLoadId}&period=${currentPeriod}&fromDate=${today}&toDate=${toDate}`
        )
      }

      const { absences } = await whereaboutsApi.getAbsences(res.locals, {
        agencyId,
        reason,
        period: period === 'AM_PM' ? '' : period,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      })

      const offenderData = absences.map(absence => ({
        offenderName: `${capitalize(absence.lastName)}, ${capitalize(absence.firstName)}`,
        offenderNo: absence.offenderNo,
        location: stripAgencyPrefix(absence.cellLocation, agencyId),
        activity: absence.eventDescription,
        comments: absence.comments,
        eventDate: readableDateFormat(absence.eventDate, 'YYYY-MM-DD'),
      }))

      const { offenders, sortOptions } = absentReasonTableViewModel(offenderData)
      const displayReason = pascalToString(reason)
      const fromDisplayDate = readableDateFormat(fromDate, 'DD/MM/YYYY')
      const toDisplayDate = readableDateFormat(toDate, 'DD/MM/YYYY')

      return res.render('attendanceStatisticsOffendersList.njk', {
        title: `${displayReason}`,
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad.description,
            id: activeCaseLoadId,
          },
        },
        displayDate: `${fromDisplayDate} - ${toDisplayDate}`,
        displayPeriod: periodDisplayLookup[period],
        reason: displayReason,
        dashboardUrl: `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${toDate}`,
        offenders,
        sortOptions,
        caseLoadId: activeCaseLoad.caseLoadId,
        allCaseloads: caseloads,
        userRoles: roles,
      })
    } catch (error) {
      return renderErrorTemplate({
        error,
        req,
        res,
        logError,
        url: `/manage-prisoner-whereabouts/attendance-reason-statistics/reason/${reason}`,
      })
    }
  }

  return {
    attendanceStatistics,
    attendanceStatisticsOffendersList,
  }
}

module.exports = { attendanceStatisticsFactory }
