import releaseDatesViewModel from './sentenceAndReleaseViewModels/releaseDatesViewModel'
import sentenceAdjustmentsViewModel from './sentenceAndReleaseViewModels/sentenceAdjustmentsViewModel'
import courtCasesViewModel from './sentenceAndReleaseViewModels/courtCasesViewModel'
import { readableDateFormat } from '../../utils'
import getContext from './prisonerProfileContext'

export default ({ prisonerProfileService, prisonApi, systemOauthClient, oauthApi, offenderSearchApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    const { username } = req.session.userDetails
    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

    const prisonerSearchDetails = await offenderSearchApi.getPrisonerDpsDetails(systemContext, offenderNo)
    const { context } = getContext({
      res,
      oauthApi,
      systemContext,
      prisonerSearchDetails,
    })

    const [prisonerProfileData, sentenceData, bookingDetails, offenceHistory] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(context, systemContext, offenderNo, false, prisonerSearchDetails),
      prisonApi.getPrisonerSentenceDetails(context, offenderNo),
      prisonApi.getDetails(context, offenderNo),
      prisonApi.getOffenceHistory(systemContext, offenderNo),
    ])
    const releaseDates = releaseDatesViewModel(sentenceData.sentenceDetail)

    const { bookingId } = bookingDetails

    const [sentenceAdjustmentsData, courtCaseData, sentenceTermsData] = await Promise.all([
      prisonApi.getSentenceAdjustments(context, bookingId),
      prisonApi.getCourtCases(context, bookingId),
      prisonApi.getSentenceTerms(context, bookingId),
    ])

    const sentenceAdjustments = sentenceAdjustmentsViewModel(sentenceAdjustmentsData)
    const courtCases = courtCasesViewModel({ courtCaseData, sentenceTermsData, offenceHistory })

    const effectiveSentenceEndDate =
      readableDateFormat(sentenceData?.sentenceDetail?.effectiveSentenceEndDate, 'YYYY-MM-DD') ||
      (prisonerProfileData.indeterminateSentence ? 'Life sentence' : undefined)

    return res.render('prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk', {
      prisonerProfileData,
      releaseDates,
      sentenceAdjustments,
      courtCases,
      showSentences: Boolean(courtCases.find((courtCase) => courtCase.sentenceTerms.length)),
      effectiveSentenceEndDate,
    })
  }
