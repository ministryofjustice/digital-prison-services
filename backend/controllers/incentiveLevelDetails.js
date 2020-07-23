const moment = require('moment')
const { properCaseName, formatDaysInYears } = require('../utils')

const getIepDetailsFactory = elite2Api => {
  const filterData = (data, fields) => {
    let filteredResults = data
    if (fields.establishment) {
      filteredResults = filteredResults.filter(result => result.agencyId === fields.establishment)
    }

    if (fields.level) {
      filteredResults = filteredResults.filter(result => result.iepLevel === fields.level)
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

  const getIepDetails = async (context, offenderNo, params) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)
    const iepSummary = await elite2Api.getIepSummaryForBooking(context, bookingDetails.bookingId, true)

    // Offenders are likely to have multiple IEPs at the same agency.
    // By getting a unique list of users and agencies, we reduce the duplicate
    // calls to the database.
    const uniqueUserIds = [...new Set(iepSummary.iepDetails.map(details => details.userId))]
    const uniqueAgencyIds = [...new Set(iepSummary.iepDetails.map(details => details.agencyId))]
    const levels = [...new Set(iepSummary.iepDetails.map(details => details.iepLevel))].sort()

    const users = await Promise.all(
      uniqueUserIds.filter(userId => Boolean(userId)).map(userId => elite2Api.getStaffDetails(context, userId))
    )

    const establishments = await Promise.all(
      uniqueAgencyIds
        .filter(agencyId => Boolean(agencyId))
        .map(agencyId => elite2Api.getAgencyDetails(context, agencyId))
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

    const filteredResults = filterData(iepHistoryDetails, params)

    return {
      currentIepLevel: iepSummary.iepLevel,
      daysOnIepLevel: `${formatDaysInYears(iepSummary.daysSinceReview) || 'Changed today'}`,
      establishments: establishments.sort((a, b) => (a.description > b.description ? 1 : -1)),
      levels,
      nextReviewDate,
      currentIepDateTime: iepSummary.iepTime,
      results: filteredResults,
      offenderAgencyId: bookingDetails.agencyId,
    }
  }

  const sortPossibleIepLevelsAlphabetically = levels => levels.sort((a, b) => (a.title > b.title ? 1 : -1))

  const getPossibleLevels = async (context, currentIepLevel, agencyId) => {
    const levels = await elite2Api.getAgencyIepLevels(context, agencyId)

    return sortPossibleIepLevelsAlphabetically(
      levels.filter(level => level.iepDescription !== currentIepLevel).map(level => ({
        title: level.iepDescription,
        value: level.iepLevel,
      }))
    )
  }

  const changeIepLevel = async (context, offenderNo, params) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)
    await elite2Api.changeIepLevel(context, bookingDetails.bookingId, params)
  }

  return {
    getIepDetails,
    changeIepLevel,
    getPossibleLevels,
  }
}

module.exports = { getIepDetailsFactory }
