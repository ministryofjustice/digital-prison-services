const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst, properCaseName, formatDaysInYears, formatName } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const filterData = (data, fields) => {
  let filteredResults = data
  if (fields.agencyId) {
    filteredResults = filteredResults.filter(result => result.agencyId === fields.agencyId)
  }

  if (fields.incentiveLevel) {
    filteredResults = filteredResults.filter(result => result.iepLevel === fields.incentiveLevel)
  }

  if (fields.fromDate) {
    const fromDate = moment(fields.fromDate)
    filteredResults = filteredResults.filter(result => moment(result.iepDate).isSameOrAfter(fromDate))
  }

  if (fields.toDate) {
    const toDate = moment(fields.toDate)
    filteredResults = filteredResults.filter(result => moment(result.iepDate).isSameOrBefore(toDate))
  }

  return filteredResults
}

module.exports = ({ prisonApi, oauthApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { agencyId, incentiveLevel, fromDate, toDate } = req.query

  const fromDateFormatted = moment(fromDate, 'DD/MM/YYYY')
  const toDateFormatted = moment(toDate, 'DD/MM/YYYY')

  try {
    const errors = []
    const [prisonerDetails, userRoles] = await Promise.all([
      prisonApi.getDetails(res.locals, offenderNo),
      oauthApi.userRoles(res.locals),
    ])
    const { bookingId, firstName, lastName } = prisonerDetails

    const iepSummary = await prisonApi.getIepSummaryForBooking(res.locals, bookingId, true)

    if (fromDate && toDate && fromDateFormatted.isAfter(toDateFormatted, 'day')) {
      errors.push({ href: '#fromDate', text: 'Enter a from date which is not after the to date' })
      errors.push({ href: '#toDate', text: 'Enter a to date which is not before the from date' })
    }

    // Offenders are likely to have multiple IEPs at the same agency.
    // By getting a unique list of users and agencies, we reduce the duplicate
    // calls to the database.
    const uniqueUserIds = [...new Set(iepSummary.iepDetails.map(details => details.userId))]
    const uniqueAgencyIds = [...new Set(iepSummary.iepDetails.map(details => details.agencyId))]
    const levels = [...new Set(iepSummary.iepDetails.map(details => details.iepLevel))].sort()

    const users = await Promise.all(
      uniqueUserIds.filter(userId => Boolean(userId)).map(userId => prisonApi.getStaffDetails(res.locals, userId))
    )

    const establishments = await Promise.all(
      uniqueAgencyIds.filter(id => Boolean(id)).map(id => prisonApi.getAgencyDetails(res.locals, id))
    )

    const iepHistoryDetails = iepSummary.iepDetails.map(details => {
      const { description } = establishments.find(estb => estb.agencyId === details.agencyId)
      const user = details.userId && users.find(u => u.username === details.userId)

      return {
        iepEstablishment: description,
        iepStaffMember: user && `${properCaseName(user.firstName)} ${properCaseName(user.lastName)}`,
        formattedTime: moment(details.iepTime, 'YYYY-MM-DD HH:mm').format('D MMMM YYYY - HH:mm'),
        ...details,
      }
    })

    const nextReviewDate = moment(iepSummary.iepTime, 'YYYY-MM-DD HH:mm')
      .add(1, 'years')
      .format('D MMMM YYYY')

    const filteredResults = filterData(iepHistoryDetails, {
      agencyId,
      incentiveLevel,
      fromDate: fromDate && fromDateFormatted.format('YYYY-MM-DD'),
      toDate: toDate && toDateFormatted.format('YYYY-MM-DD'),
    })

    const prisonerWithinCaseloads = res.locals.user.allCaseloads.find(cl => cl.caseLoadId === prisonerDetails.agencyId)

    const userCanMaintainIEP = userRoles.find(role => role.roleCode === 'MAINTAIN_IEP')

    const noFiltersSupplied = Boolean(!agencyId && !incentiveLevel && !fromDate && !toDate)

    const noResultsFoundMessage =
      (!filteredResults.length &&
        (noFiltersSupplied
          ? `${formatName(firstName, lastName)} has no incentive level history`
          : 'There is no incentive level history for the selections you have made')) ||
      ''

    return res.render('prisonerProfile/prisonerIncentiveLevelDetails.njk', {
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      currentIepDateTime: iepSummary.iepTime,
      currentIepLevel: iepSummary.iepLevel,
      daysOnIepLevel: `${formatDaysInYears(iepSummary.daysSinceReview) || 'Changed today'}`,
      dpsUrl,
      errors,
      formValues: req.query,
      noResultsFoundMessage,
      establishments: establishments.sort((a, b) => a.description.localeCompare(b.description)).map(establishment => ({
        text: establishment.description,
        value: establishment.agencyId,
      })),
      levels: levels.map(level => ({
        text: level,
        value: level,
      })),
      nextReviewDate,
      offenderNo,
      prisonerName: formatName(firstName, lastName),
      profileUrl: `/prisoner/${offenderNo}`,
      results: filteredResults,
      userCanUpdateIEP: Boolean(prisonerWithinCaseloads && userCanMaintainIEP),
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    res.status(500)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}
