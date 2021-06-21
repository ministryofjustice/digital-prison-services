const releaseDatesViewModel = require('./sentenceAndReleaseViewModels/releaseDatesViewModel')
const sentenceAdjustmentsViewModel = require('./sentenceAndReleaseViewModels/sentenceAdjustmentsViewModel')
const courtCasesViewModel = require('./sentenceAndReleaseViewModels/courtCasesViewModel')
const { readableDateFormat } = require('../../utils')

function getEffectiveSentenceEndDate(sentenceData, prisonerDetails) {
  return (
    readableDateFormat(sentenceData?.sentenceDetail?.effectiveSentenceEndDate, 'YYYY-MM-DD') ||
    (prisonerDetails?.imprisonmentStatus === 'LIFE' ? 'Life sentence' : undefined)
  )
}

module.exports = ({ prisonerProfileService, prisonApi, systemOauthClient }) => async (req, res) => {
  const { offenderNo } = req.params

  const { username } = req.session.userDetails
  const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

  const [prisonerProfileData, sentenceData, prisonerData, offenceHistory] = await Promise.all([
    prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
    prisonApi.getPrisonerSentenceDetails(res.locals, offenderNo),
    prisonApi.getPrisonerDetails(res.locals, offenderNo),
    prisonApi.getOffenceHistory(systemContext, offenderNo),
  ])
  const releaseDates = releaseDatesViewModel(sentenceData.sentenceDetail)

  const prisonerDetails = prisonerData[0]

  const [sentenceAdjustmentsData, courtCaseData, sentenceTermsData] = await Promise.all([
    prisonApi.getSentenceAdjustments(res.locals, prisonerDetails.latestBookingId),
    prisonApi.getCourtCases(res.locals, prisonerDetails.latestBookingId),
    prisonApi.getSentenceTerms(res.locals, prisonerDetails.latestBookingId),
  ])

  const sentenceAdjustments = sentenceAdjustmentsViewModel(sentenceAdjustmentsData)
  const courtCases = courtCasesViewModel({ courtCaseData, sentenceTermsData, offenceHistory })

  return res.render('prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk', {
    prisonerProfileData,
    releaseDates,
    sentenceAdjustments,
    courtCases,
    showSentences: Boolean(courtCases.find(courtCase => courtCase.sentenceTerms.length)),
    effectiveSentenceEndDate: getEffectiveSentenceEndDate(sentenceData, prisonerDetails),
  })
}
