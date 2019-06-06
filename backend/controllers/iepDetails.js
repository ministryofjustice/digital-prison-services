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
      filteredResults = filteredResults.filter(result => moment(result.iepTime).isSameOrAfter(fromDate))
    }

    if (fields.toDate) {
      const toDate = moment(fields.toDate)
      filteredResults = filteredResults.filter(result => moment(result.iepTime).isSameOrBefore(toDate))
    }

    return filteredResults
  }

  const getIepDetails = async (context, offenderNo, params) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)
    const iepSummary = await elite2Api.getIepSummaryWithDetails(context, bookingDetails.bookingId)

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
        formattedTime: moment(details.iepTime, 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY - HH:mm'),
        ...details,
      }
    })

    const nextReviewDate = moment(iepSummary.iepTime, 'YYYY-MM-DD HH:mm')
      .add(1, 'years')
      .format('DD/MM/YYYY')

    const filteredResults = filterData(iepHistoryDetails, params)

    return {
      currentIepLevel: iepSummary.iepLevel,
      daysOnIepLevel: `${formatDaysInYears(iepSummary.daysSinceReview) || 'Changed today'}`,
      establishments: establishments.sort((a, b) => (a.description > b.description ? 1 : -1)),
      levels,
      nextReviewDate,
      currentIepDateTime: iepSummary.iepTime,
      results: filteredResults,
    }
  }

  const iconForDifference = {
    '1': 'Green_arrow.png',
    '2': 'Double_green_arrow.png',
    '3': 'TripleGreenArrow.png',
    '-1': 'Red_arrow.png',
    '-2': 'Double_red_arrow.png',
  }

  const levelToIntMap = {
    Entry: 1,
    Basic: 2,
    Standard: 3,
    Enhanced: 4,
  }

  const getPossibleLevels = async (context, currentIepLevel, agencyId) => {
    const levels = await elite2Api.getAgencyIepLevels(context, agencyId)

    return levels
      .filter(level => level.iepDescription !== currentIepLevel)
      .filter(level => level.iepDescription !== 'Entry')
      .map(level => {
        let diff
        if (levelToIntMap[level.iepDescription] && levelToIntMap[currentIepLevel]) {
          diff = levelToIntMap[level.iepDescription] - levelToIntMap[currentIepLevel]
        } else {
          // This is a custom level for which we do not have an icon. Always show it last.
          diff = 1000
        }
        return {
          title: level.iepDescription,
          value: level.iepLevel,
          image: iconForDifference[diff.toString()] ? iconForDifference[diff.toString()] : '',
          diff,
        }
      })
      .sort((a, b) => (Math.abs(a.diff) > Math.abs(b.diff) ? 1 : -1))
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
