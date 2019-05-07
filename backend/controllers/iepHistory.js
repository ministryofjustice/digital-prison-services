const moment = require('moment')

const getIepHistoryFactory = elite2Api => {
  const getIepHistory = async (context, offenderNo) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)
    const iepSummary = await elite2Api.getIepSummaryWithDetails(context, bookingDetails.bookingId)
    const iepHistoryDetails = []

    /* eslint-disable no-restricted-syntax */
    for (const details of iepSummary.iepDetails) {
      /* eslint-disable no-await-in-loop */
      const iepEstablishment = await elite2Api.getAgencyDetails(context, details.agencyId)
      let iepStaffMember = ''
      if (details.userId) {
        const iepStaffMemberDetails = await elite2Api.getStaffDetails(context, details.userId)
        iepStaffMember = `${iepStaffMemberDetails.firstName} ${iepStaffMemberDetails.lastName}`
      }

      iepHistoryDetails.push({
        iepEstablishment: iepEstablishment.description,
        iepStaffMember,
        formattedTime: moment(details.iepTime, 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY - HH:mm'),
        ...details,
      })
    }

    const currentIepEstablishment = iepHistoryDetails[0].iepEstablishment

    iepHistoryDetails.shift()

    return {
      currentIepLevel: iepSummary.iepLevel,
      daysOnIepLevel: iepSummary.daysSinceReview,
      currentIepDateTime: iepSummary.iepTime,
      currentIepEstablishment,
      iepHistory: iepHistoryDetails,
      offenderName: `${bookingDetails.lastName}, ${bookingDetails.firstName}`,
    }
  }

  return {
    getIepHistory,
  }
}

module.exports = { getIepHistoryFactory }
