const getIepHistoryFactory = elite2Api => {
  const getIepHistory = async ({ context, offenderNo }) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)
    const iepSummary = await elite2Api.getIepSummaryWithDetails(context, bookingDetails.bookingId)
    return {
      currentIepLevel: iepSummary.iepLevel,
      daysOnIepLevel: iepSummary.daysSinceReview,
      currentIepDateTime: iepSummary.iepTime,
      currentIepEstablishment: iepSummary.iepDetails[0].agencyId,
      iepHistory: iepSummary.iepDetails,
      offenderName: `${bookingDetails.lastName}, ${bookingDetails.firstName}`,
    }
  }

  return {
    getIepHistory,
  }
}

module.exports = { getIepHistoryFactory }
