const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { formatCurrency, capitalizeUppercaseString } = require('../../utils')
const formatAward = require('../../shared/formatAward')
const filterActivitiesByPeriod = require('../../shared/filterActivitiesByPeriod')
const getValueByType = require('../../shared/getValueByType')

const log = require('../../log')

const captureErrorAndContinue = apiCall =>
  new Promise(resolve => {
    apiCall.then(response => resolve({ response })).catch(error => {
      log.error(error)
      resolve({ error: true })
    })
  })

const extractResponse = (complexData, key) => {
  if (!complexData || complexData.error) return null

  return key ? complexData.response[key] : complexData.response
}

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { username } = req.session.userDetails

  try {
    const details = await elite2Api.getDetails(res.locals, offenderNo)

    try {
      const { bookingId } = details || {}

      const dateThreeMonthsAgo = moment()
        .subtract(3, 'months')
        .format('YYYY-MM-DD')
      const today = moment().format('YYYY-MM-DD')

      const [
        prisonerProfileDataResponse,
        offenceDataResponse,
        balanceDataResponse,
        prisonerDataResponse,
        sentenceDataResponse,
        iepSummaryResponse,
        positiveCaseNotesResponse,
        negativeCaseNotesResponse,
        adjudicationsResponse,
        nextVisitResponse,
        visitBalancesResponse,
        todaysEventsResponse,
      ] = await Promise.all(
        [
          prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo, username),
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
        ].map(apiCall => captureErrorAndContinue(apiCall))
      )

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
      ] = [
        prisonerProfileDataResponse,
        offenceDataResponse,
        balanceDataResponse,
        prisonerDataResponse,
        sentenceDataResponse,
        iepSummaryResponse,
        positiveCaseNotesResponse,
        negativeCaseNotesResponse,
        adjudicationsResponse,
        nextVisitResponse,
        visitBalancesResponse,
        todaysEventsResponse,
      ].map(response => extractResponse(response))

      const prisoner = prisonerData && prisonerData[0]
      const { profileInformation } = prisonerProfileData || {}
      const { morningActivities, afternoonActivities, eveningActivities } = filterActivitiesByPeriod(todaysEvents)
      const unableToShowDetailMessage = 'Unable to show this detail'

      const daysSinceReview = (iepSummary && iepSummary.daysSinceReview) || 0

      return res.render('prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk', {
        dpsUrl,
        prisonerProfileData,
        offenceDetailsSectionError: Boolean(
          offenceDataResponse.error && prisonerDataResponse.error && sentenceDataResponse.error
        ),
        offenceDetails: [
          {
            label: 'Main offence',
            value: offenceDataResponse.error
              ? unableToShowDetailMessage
              : (offenceData && offenceData[0] && offenceData[0].offenceDescription) || 'Not entered',
          },
          {
            label: 'Imprisonment status',
            value: prisonerDataResponse.error
              ? unableToShowDetailMessage
              : (prisoner && prisoner.imprisonmentStatusDesc) || 'Not entered',
          },
          {
            label: 'Release date',
            value: sentenceDataResponse.error
              ? unableToShowDetailMessage
              : (sentenceData &&
                  sentenceData.sentenceDetail &&
                  sentenceData.sentenceDetail.releaseDate &&
                  moment(sentenceData.sentenceDetail.releaseDate).format('D MMMM YYYY')) ||
                'Not entered',
          },
        ],
        balanceDetailsSectionError: Boolean(balanceDataResponse.error),
        balanceDetails: [
          {
            label: 'Spends',
            value: formatCurrency((balanceData && balanceData.spends) || 0, balanceData && balanceData.currency),
          },
          {
            label: 'Private',
            value: formatCurrency((balanceData && balanceData.cash) || 0, balanceData && balanceData.currency),
          },
          {
            label: 'Savings',
            value: formatCurrency((balanceData && balanceData.savings) || 0, balanceData && balanceData.currency),
          },
        ],
        incentives: {
          incentivesSectionError: Boolean(
            negativeCaseNotesResponse.error && positiveCaseNotesResponse.error && iepSummaryResponse.error
          ),
          details: [
            {
              label: 'Incentive level warnings',
              value: negativeCaseNotesResponse.error
                ? unableToShowDetailMessage
                : (negativeCaseNotes && negativeCaseNotes.count) || 0,
            },
            {
              label: 'Incentive encouragements',
              value: positiveCaseNotesResponse.error
                ? unableToShowDetailMessage
                : (positiveCaseNotes && positiveCaseNotes.count) || 0,
            },
            {
              label: 'Last incentive level review',
              value: iepSummaryResponse.error
                ? unableToShowDetailMessage
                : `${daysSinceReview} ${daysSinceReview === 1 ? 'day' : 'days'} ago`,
            },
          ],
        },
        adjudications: {
          adjudicationsSectionError: Boolean(adjudicationsResponse.error),
          active: {
            label: 'Active adjudications',
            ...(adjudications && {
              value:
                adjudications.awards &&
                adjudications.awards
                  .map(award => formatAward(award))
                  .filter(({ status }) => status && !status.startsWith('SUSP') && status !== 'QUASHED'),
            }),
          },
          proven: {
            label: 'Proven adjudications',
            value: adjudicationsResponse.error
              ? unableToShowDetailMessage
              : (adjudications && adjudications.adjudicationCount) || 0,
          },
        },
        personalDetailsSectionError: Boolean(prisonerDataResponse.error && prisonerProfileDataResponse.error),
        personalDetails: [
          {
            label: 'Age',
            value: prisonerDataResponse.error
              ? unableToShowDetailMessage
              : prisoner && prisoner.dateOfBirth && moment().diff(moment(prisoner.dateOfBirth), 'years'),
          },
          {
            label: 'Nationality',
            value: prisonerProfileDataResponse.error
              ? unableToShowDetailMessage
              : getValueByType('NAT', profileInformation, 'resultValue') || 'Not entered',
          },
          {
            label: 'PNC number',
            value: prisonerDataResponse.error
              ? unableToShowDetailMessage
              : (prisoner && prisoner.pncNumber) || 'Not entered',
          },
          {
            label: 'CRO number',
            value: prisonerDataResponse.error
              ? unableToShowDetailMessage
              : (prisoner && prisoner.croNumber) || 'Not entered',
          },
        ],
        visits: {
          visitSectionError: Boolean(visitBalancesResponse.error && nextVisitResponse.error),
          details: [
            {
              label: 'Remaining visits',
              value: visitBalancesResponse.error
                ? unableToShowDetailMessage
                : visitBalances && (visitBalances.remainingVo === 0 ? 0 : visitBalances.remainingVo || 'Not entered'),
            },
            {
              label: 'Remaining privileged visits',
              value: visitBalancesResponse.error
                ? unableToShowDetailMessage
                : visitBalances && (visitBalances.remainingPvo === 0 ? 0 : visitBalances.remainingPvo || 'Not entered'),
            },
            {
              label: 'Next visit date',
              value:
                (nextVisitResponse.error && unableToShowDetailMessage) ||
                (nextVisit && nextVisit.startTime
                  ? moment(nextVisit.startTime).format('D MMMM YYYY')
                  : 'No upcoming visits'),
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
        scheduledActivityPeriodsSectionError: Boolean(todaysEventsResponse.error),
        scheduledActivityPeriods: [
          { label: 'Morning', value: morningActivities },
          { label: 'Afternoon', value: afternoonActivities },
          { label: 'Evening', value: eveningActivities },
        ],
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
    }
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: dpsUrl })
  }
}
