const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { formatTimestampToDate, formatCurrency, capitalizeUppercaseString } = require('../../utils')
const formatAward = require('../../shared/formatAward')
const filterActivitiesByPeriod = require('../../shared/filterActivitiesByPeriod')
const logErrorAndContinue = require('../../shared/logErrorAndContinue')

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const details = await elite2Api
    .getDetails(res.locals, offenderNo)
    .then(data => data)
    .catch(error => {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: dpsUrl })
    })
  const { bookingId } = details || {}

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
    todaysEvents,
  ] = await Promise.all(
    [
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
      elite2Api.getEventsForToday(res.locals, bookingId),
    ].map(apiCall => logErrorAndContinue(apiCall))
  )

  const prisoner = prisonerData && prisonerData[0]
  const { morningActivities, afternoonActivities, eveningActivities } = filterActivitiesByPeriod(todaysEvents)

  return res.render('prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk', {
    dpsUrl,
    prisonerProfileData,
    offenceDetails: [
      {
        label: 'Main offence(s)',
        value: offenceData && offenceData[0] && offenceData[0].offenceDescription,
      },
      { label: 'Imprisonment status', value: prisoner && prisoner.imprisonmentStatusDesc },
      {
        label: 'Release date',
        value:
          sentenceData &&
          sentenceData.sentenceDetail &&
          sentenceData.sentenceDetail.releaseDate &&
          formatTimestampToDate(sentenceData.sentenceDetail.releaseDate),
      },
    ],
    balanceDetails: [
      { label: 'Spends', value: balanceData && formatCurrency(balanceData.spends, balanceData.currency) },
      { label: 'Private', value: balanceData && formatCurrency(balanceData.cash, balanceData.currency) },
      { label: 'Savings', value: balanceData && formatCurrency(balanceData.savings, balanceData.currency) },
    ],
    caseNoteAdjudications: {
      details: [
        { label: 'Incentive level warnings', value: negativeCaseNotes && negativeCaseNotes.count },
        { label: 'Incentive Encouragements', value: positiveCaseNotes && positiveCaseNotes.count },
        { label: 'Last incentive level review', value: iepSummary && iepSummary.daysSinceReview },
        { label: 'Proven adjudications', value: adjudications && adjudications.adjudicationCount },
      ],
      activeAdjudicationsDetails: {
        label: 'Active adjudications',
        ...(adjudications && {
          value:
            adjudications.awards &&
            adjudications.awards
              .map(award => formatAward(award))
              .filter(({ status }) => status && !status.startsWith('SUSP') && status !== 'QUASHED'),
        }),
      },
    },
    personalDetails: [
      { label: 'Age', value: prisoner && prisoner.dateOfBirth && moment().diff(moment(prisoner.dateOfBirth), 'years') },
      { label: 'Nationality', value: prisoner && prisoner.nationalities },
      { label: 'PNC number', value: prisoner && prisoner.pncNumber },
      { label: 'CRO number', value: prisoner && prisoner.croNumber },
    ],
    visits: {
      details: [
        { label: 'Remaining visits', value: visitBalances && visitBalances.remainingVo },
        { label: 'Remaining privileged visits', value: visitBalances && visitBalances.remainingPvo },
        {
          label: 'Next visit date',
          value: nextVisit && nextVisit.startTime ? formatTimestampToDate(nextVisit.startTime) : 'No upcoming visits',
        },
      ],
      ...(nextVisit &&
        nextVisit.startTime && {
          nextVisitDetails: [
            { label: 'Type of visit', value: nextVisit.visitTypeDescription },
            {
              label: 'Lead visitor',
              value: `${capitalizeUppercaseString(nextVisit.leadVisitor)} (${nextVisit.relationshipDescription})`,
            },
          ],
        }),
    },
    scheduledActivityPeriods: [
      { label: 'Morning (AM)', value: morningActivities },
      { label: 'Afternoon (PM)', value: afternoonActivities },
      { label: 'Evening (ED)', value: eveningActivities },
    ],
  })
}
