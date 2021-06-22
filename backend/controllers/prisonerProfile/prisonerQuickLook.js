const moment = require('moment')
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

const getDetails = async ({ res, offenderNo, prisonApi }) => {
  try {
    return await prisonApi.getDetails(res.locals, offenderNo)
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}

const createFinanceLink = (offenderNo, path, value) =>
  `<a href="/prisoner/${offenderNo}/prisoner-finance-details/${path}" class="govuk-link">${formatCurrency(
    value || 0
  )}</a>`

const extractLifeImprisonmentStatus = (prisonerDataResponse, prisoner, unableToShowDetailMessage) => {
  if (prisonerDataResponse.error) {
    return unableToShowDetailMessage
  }
  return prisoner?.imprisonmentStatus === 'LIFE' ? 'Life sentence' : 'Not entered'
}

module.exports = ({ prisonerProfileService, prisonApi }) => async (req, res) => {
  const { offenderNo } = req.params
  const { username } = req.session.userDetails

  const details = await getDetails({ prisonApi, res, offenderNo })
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
      prisonApi.getMainOffence(res.locals, bookingId),
      prisonApi.getPrisonerBalances(res.locals, bookingId),
      prisonApi.getPrisonerDetails(res.locals, offenderNo),
      prisonApi.getPrisonerSentenceDetails(res.locals, offenderNo),
      prisonApi.getIepSummaryForBooking(res.locals, bookingId, false),
      prisonApi.getPositiveCaseNotes(res.locals, bookingId, dateThreeMonthsAgo, today),
      prisonApi.getNegativeCaseNotes(res.locals, bookingId, dateThreeMonthsAgo, today),
      prisonApi.getAdjudicationsForBooking(res.locals, bookingId),
      prisonApi.getNextVisit(res.locals, bookingId),
      prisonApi.getPrisonerVisitBalances(res.locals, offenderNo),
      prisonApi.getEventsForToday(res.locals, bookingId),
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
            extractLifeImprisonmentStatus(prisonerDataResponse, prisoner, unableToShowDetailMessage),
      },
    ],
    balanceDetailsSectionError: Boolean(balanceDataResponse.error),
    balanceDetails: [
      {
        label: 'Spends',
        visible: true,
        html: createFinanceLink(offenderNo, 'spends', balanceData?.spends),
      },
      {
        label: 'Private cash',
        visible: true,
        html: createFinanceLink(offenderNo, 'private-cash', balanceData?.cash),
      },
      {
        label: 'Savings',
        visible: true,
        html: createFinanceLink(offenderNo, 'savings', balanceData?.savings),
      },
      {
        label: 'Damage obligations',
        visible: balanceData?.damageObligations > 0,
        html: createFinanceLink(offenderNo, 'damage-obligations', balanceData?.damageObligations),
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
}
