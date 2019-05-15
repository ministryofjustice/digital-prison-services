const moment = require('moment')

const getIepHistoryFactory = elite2Api => {
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
      filteredResults = filteredResults.filter(result => moment(result.iepTime).isSameOrAfter(fromDate))
    }

    if (fields.toDate) {
      const toDate = moment(fields.toDate)
      filteredResults = filteredResults.filter(result => moment(result.iepTime).isSameOrBefore(toDate))
    }

    return filteredResults
  }

  const getIepHistory = async (context, offenderNo, params) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)
    const iepSummary = await elite2Api.getIepSummaryWithDetails(context, bookingDetails.bookingId)
    const [currentDetail, ...iepHistory] = iepSummary.iepDetails

    // Offenders are likely to have multiple IEPs at the same agency.
    // By getting a unique list of users and agencies, we reduce the duplicate
    // calls to the database.
    const uniqueUserIds = [...new Set(iepHistory.map(details => details.userId))]
    const uniqueAgencyIds = [...new Set(iepHistory.map(details => details.agencyId))]
    const levels = [...new Set(iepHistory.map(details => details.iepLevel))].sort()

    const users = await Promise.all(
      uniqueUserIds.filter(userId => Boolean(userId)).map(userId => elite2Api.getStaffDetails(context, userId))
    )

    const establishments = await Promise.all(
      uniqueAgencyIds
        .filter(agencyId => Boolean(agencyId))
        .map(agencyId => elite2Api.getAgencyDetails(context, agencyId))
    )

    const iepHistoryDetails = iepHistory.map(details => {
      const { description } = establishments.find(estb => estb.agencyId === details.agencyId)
      const user = details.userId && users.find(u => u.username === details.userId)
      return {
        iepEstablishment: description,
        iepStaffMember: user && `${user.firstName} ${user.lastName}`,
        formattedTime: moment(details.iepTime, 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY - HH:mm'),
        ...details,
      }
    })

    const nextReviewDate = moment(currentDetail.iepTime, 'YYYY-MM-DD HH:mm')
      .add(1, 'years')
      .format('DD/MM/YYYY')

    const filteredResults = filterData(iepHistoryDetails, params)

    return {
      currentIepLevel: iepSummary.iepLevel,
      daysOnIepLevel: iepSummary.daysSinceReview,
      establishments: establishments.sort((a, b) => (a.description > b.description ? 1 : -1)),
      levels,
      nextReviewDate,
      currentIepDateTime: iepSummary.iepTime,
      results: filteredResults,
    }
  }

  return {
    getIepHistory,
  }
}

module.exports = { getIepHistoryFactory }
