const releaseDatesViewModel = require('./sentenceAndReleaseViewModels/releaseDatesViewModel')
const sentenceAdjustmentsViewModel = require('./sentenceAndReleaseViewModels/sentenceAdjustmentsViewModel')
const { serviceUnavailableMessage } = require('../../common-messages')

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const [prisonerProfileData, sentenceData, bookingDetails] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getPrisonerSentenceDetails(res.locals, offenderNo),
      elite2Api.getDetails(res.locals, offenderNo),
    ])
    const releaseDates = releaseDatesViewModel(sentenceData.sentenceDetail)

    const { bookingId } = bookingDetails

    const sentenceAdjustmentsData = await elite2Api.getSentenceAdjustments(res.locals, bookingId)
    const sentenceAdjustments = sentenceAdjustmentsViewModel(sentenceAdjustmentsData)

    return res.render('prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk', {
      prisonerProfileData,
      releaseDates,
      sentenceAdjustments,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/sentence-and-release` })
  }
}
