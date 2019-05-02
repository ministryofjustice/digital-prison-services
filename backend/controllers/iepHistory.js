const asyncMiddleware = require('../middleware/asyncHandler')

const getIepHistoryFactory = elite2Api => {
  const getIepHistory = asyncMiddleware(async (req, res) => {
    const bookingDetails = await elite2Api.getDetails(res.locals, req.params.offenderNo)
    const iepSummary = await elite2Api.getIepSummaryWithDetails(res.locals, bookingDetails.bookingId)
    const response = {
      currentIepLevel: iepSummary.iepLevel,
      daysOnIepLevel: iepSummary.daysSinceReview,
      currentIepDateTime: iepSummary.iepTime,
      currentIepEstablishment: iepSummary.iepDetails[0].agencyId,
      iepHistory: iepSummary.iepDetails,
      offenderName: `${bookingDetails.lastName}, ${bookingDetails.firstName}`,
    }
    res.json(response)
  })

  return {
    getIepHistory,
  }
}

module.exports = { getIepHistoryFactory }
