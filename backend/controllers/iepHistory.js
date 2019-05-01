const asyncMiddleware = require('../middleware/asyncHandler')

const getIepHistoryFactory = elite2Api => {
  const getIepHistory = asyncMiddleware(async (req, res) => {
    const bookingDetails = await elite2Api.getDetails(res.locals, req.params.offenderNo)
    const response = await elite2Api.getIepSummary(res.locals, [bookingDetails.bookingId])
    res.json(response)
  })

  return {
    getIepHistory,
  }
}

module.exports = { getIepHistoryFactory }
