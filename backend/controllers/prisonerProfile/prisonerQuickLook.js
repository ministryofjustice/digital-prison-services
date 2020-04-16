const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { formatTimestampToDate, formatCurrency, capitalizeUppercaseString } = require('../../utils')
const formatAward = require('../../shared/formatAward')

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  try {
    const { offenderNo } = req.params
    const details = await elite2Api.getDetails(res.locals, offenderNo)
    const { bookingId } = details

    const dateThreeMonthsAgo = moment()
      .subtract(3, 'months')
      .format('YYYY-MM-DD')
    const today = moment().format('YYYY-MM-DD')

    const [
      prisonerProfileData,
      offenceData,
      balanceData,
      prisonerData,
      sentenceData,
      iepSummary,
      positiveCaseNotes,
      negativeCaseNotes,
      adjudications,
      nextVisit,
      visitBalances,
    ] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getMainOffence(res.locals, bookingId),
      elite2Api.getPrisonerBalances(res.locals, bookingId),
      elite2Api.getPrisonerDetails(res.locals, offenderNo),
      elite2Api.getPrisonerSentenceDetails(res.locals, offenderNo),
      elite2Api.getIepSummaryForBooking(res.locals, bookingId, false),
      elite2Api.getPositiveCaseNotes(res.locals, bookingId, dateThreeMonthsAgo, today),
      elite2Api.getNegativeCaseNotes(res.locals, bookingId, dateThreeMonthsAgo, today),
      elite2Api.getAdjudicationsForBooking(res.locals, bookingId),
      elite2Api.getNextVisit(res.locals, bookingId),
      elite2Api.getPrisonerVisitBalances(res.locals, offenderNo),
    ])

    const prisoner = Boolean(prisonerData.length) && prisonerData[0]
    const { sentenceDetail } = sentenceData

    return res.render('prisonerProfile/prisonerQuickLook.njk', {
      prisonerProfileData,
      offenceDetails: [
        { label: 'Main offence(s)', value: Boolean(offenceData.length) && offenceData[0].offenceDescription },
        { label: 'Imprisonment status', value: prisoner && prisoner.imprisonmentStatusDesc },
        {
          label: 'Release date',
          value: sentenceDetail && sentenceDetail.releaseDate && formatTimestampToDate(sentenceDetail.releaseDate),
        },
      ],
      balanceDetails: [
        { label: 'Spends', value: formatCurrency(balanceData.spends, balanceData.currency) },
        { label: 'Private', value: formatCurrency(balanceData.cash, balanceData.currency) },
        { label: 'Savings', value: formatCurrency(balanceData.savings, balanceData.currency) },
      ],
      caseNoteAdjudications: {
        details: [
          { label: 'Incentive level warnings', value: negativeCaseNotes.count },
          { label: 'Incentive Encouragements', value: positiveCaseNotes.count },
          { label: 'Last incentive level review', value: iepSummary.daysSinceReview },
          { label: 'Proven adjudications', value: adjudications.adjudicationCount },
        ],
        activeAdjudicationsDetails: {
          label: 'Active adjudications',
          value:
            adjudications.awards &&
            adjudications.awards
              .map(award => formatAward(award))
              .filter(({ status }) => status && !status.startsWith('SUSP') && status !== 'QUASHED'),
        },
      },
      personalDetails: [
        { label: 'Age', value: prisoner.dateOfBirth && moment().diff(moment(prisoner.dateOfBirth), 'years') },
        { label: 'Nationality', value: prisoner.nationalities },
        { label: 'PNC number', value: prisoner.pncNumber },
        { label: 'CRO number', value: prisoner.croNumber },
      ],
      visits: {
        details: [
          { label: 'Remaining visits', value: visitBalances.remainingVo },
          { label: 'Remaining privileged visits', value: visitBalances.remainingPvo },
          {
            label: 'Next visit date',
            value: nextVisit.startTime ? formatTimestampToDate(nextVisit.startTime) : 'No upcoming visits',
          },
        ],
        ...(nextVisit.startTime && {
          nextVisitDetails: [
            { label: 'Type of visit', value: nextVisit.visitTypeDescription },
            {
              label: 'Lead visitor',
              value: `${capitalizeUppercaseString(nextVisit.leadVisitor)} (${nextVisit.relationshipDescription})`,
            },
          ],
        }),
      },
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: dpsUrl })
  }
}
