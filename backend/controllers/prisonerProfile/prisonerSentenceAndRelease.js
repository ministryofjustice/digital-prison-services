const releaseDatesViewModel = require('./sentenceAndReleaseViewModels/releaseDatesViewModel')
const sentenceAdjustmentsViewModel = require('./sentenceAndReleaseViewModels/sentenceAdjustmentsViewModel')
const courtCasesViewModel = require('./sentenceAndReleaseViewModels/courtCasesViewModel')
const { serviceUnavailableMessage } = require('../../common-messages')
const { readableDateFormat } = require('../../utils')

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const [prisonerProfileData, sentenceData, bookingDetails, offenceHistory] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getPrisonerSentenceDetails(res.locals, offenderNo),
      elite2Api.getDetails(res.locals, offenderNo),
      elite2Api.getOffenceHistory(res.locals, offenderNo),
    ])
    const releaseDates = releaseDatesViewModel(sentenceData.sentenceDetail)

    const { bookingId } = bookingDetails

    const sentenceAdjustmentsData = await elite2Api.getSentenceAdjustments(res.locals, bookingId)
    const courtCaseData = await elite2Api.getCourtCases(res.locals, bookingId)
    const sentenceTermsData = await elite2Api.getSentenceTerms(res.locals, bookingId)

    const sentenceAdjustments = sentenceAdjustmentsViewModel(sentenceAdjustmentsData)

    const courtCases = courtCasesViewModel({ courtCaseData, sentenceTermsData, offenceHistory })

    return res.render('prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk', {
      prisonerProfileData,
      releaseDates,
      sentenceAdjustments,
      courtCases,
      effectiveSentenceEndDate:
        sentenceData &&
        sentenceData.sentenceDetail &&
        readableDateFormat(sentenceData.sentenceDetail.effectiveSentenceEndDate, 'YYYY-MM-DD'),
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/sentence-and-release` })
  }
}
