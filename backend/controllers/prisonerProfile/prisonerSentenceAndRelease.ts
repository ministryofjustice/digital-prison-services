import releaseDatesViewModel from './sentenceAndReleaseViewModels/releaseDatesViewModel'
import sentenceAdjustmentsViewModel from './sentenceAndReleaseViewModels/sentenceAdjustmentsViewModel'
import courtCasesViewModel from './sentenceAndReleaseViewModels/courtCasesViewModel'
import { readableDateFormat } from '../../utils'

export default ({ prisonerProfileService, prisonApi, systemOauthClient }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    const { username } = req.session.userDetails
    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

    const [prisonerProfileData, sentenceData, bookingDetails, offenceHistory] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      prisonApi.getPrisonerSentenceDetails(res.locals, offenderNo),
      prisonApi.getDetails(res.locals, offenderNo),
      prisonApi.getOffenceHistory(systemContext, offenderNo),
    ])
    const releaseDates = releaseDatesViewModel(sentenceData.sentenceDetail)

    const { bookingId } = bookingDetails

    const [sentenceAdjustmentsData, courtCaseData, sentenceTermsData] = await Promise.all([
      prisonApi.getSentenceAdjustments(res.locals, bookingId),
      prisonApi.getCourtCases(res.locals, bookingId),
      prisonApi.getSentenceTerms(res.locals, bookingId),
    ])

    const sentenceAdjustments = sentenceAdjustmentsViewModel(sentenceAdjustmentsData)
    const courtCases = courtCasesViewModel({ courtCaseData, sentenceTermsData, offenceHistory })

    const getEffectiveSentenceEndDate = async () =>
      readableDateFormat(sentenceData?.sentenceDetail?.effectiveSentenceEndDate, 'YYYY-MM-DD') ||
      prisonerProfileData.indeterminateSentence
        ? 'Life sentence'
        : undefined

    return res.render('prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk', {
      prisonerProfileData,
      releaseDates,
      sentenceAdjustments,
      courtCases,
      showSentences: Boolean(courtCases.find((courtCase) => courtCase.sentenceTerms.length)),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      effectiveSentenceEndDate: await getEffectiveSentenceEndDate(sentenceData),
    })
  }
