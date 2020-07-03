const releaseDatesViewModel = require('./sentenceAndReleaseViewModels/releaseDatesViewModel')
const sentenceAdjustmentsViewModel = require('./sentenceAndReleaseViewModels/sentenceAdjustmentsViewModel')
const courtCasesViewModel = require('./sentenceAndReleaseViewModels/courtCasesViewModel')
const { serviceUnavailableMessage } = require('../../common-messages')
const { readableDateFormat } = require('../../utils')

module.exports = ({ prisonerProfileService, elite2Api, systemOauthClient, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const { username } = req.session.userDetails
    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

    const [prisonerProfileData, sentenceData, bookingDetails, offenceHistory] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getPrisonerSentenceDetails(res.locals, offenderNo),
      elite2Api.getDetails(res.locals, offenderNo),
      elite2Api.getOffenceHistory(systemContext, offenderNo),
    ])
    const releaseDates = releaseDatesViewModel(sentenceData.sentenceDetail)

    const { bookingId } = bookingDetails

    const [sentenceAdjustmentsData, courtCaseData, sentenceTermsData] = await Promise.all([
      elite2Api.getSentenceAdjustments(res.locals, bookingId),
      elite2Api.getCourtCases(res.locals, bookingId),
      elite2Api.getSentenceTerms(res.locals, bookingId),
    ])

    const sentenceAdjustments = sentenceAdjustmentsViewModel(sentenceAdjustmentsData)
    const courtCases = courtCasesViewModel({ courtCaseData, sentenceTermsData, offenceHistory })

    return res.render('prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk', {
      prisonerProfileData,
      releaseDates,
      sentenceAdjustments,
      courtCases,
      showSentences: Boolean(courtCases.find(courtCase => courtCase.sentenceTerms.length)),
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
