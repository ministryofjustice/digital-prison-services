import moment from 'moment'
import log from '../../log'
import { daysSince, formatCurrency } from '../../utils'
import formatAward from '../../shared/formatAward'
import filterActivitiesByPeriod from '../../shared/filterActivitiesByPeriod'
import getValueByType from '../../shared/getValueByType'
import getContext from './prisonerProfileContext'
import type apis from '../../apis'
import config from '../../config'

export const trackEvent = (telemetry, username, activeCaseLoad) => {
  if (telemetry) {
    telemetry.trackEvent({
      name: `ViewPrisonerProfile`,
      properties: { username, caseLoadId: activeCaseLoad?.caseLoadId },
    })
  }
}

const captureErrorAndContinue = (apiCall) =>
  new Promise((resolve) => {
    apiCall
      .then((response) => resolve({ response }))
      .catch((error) => {
        log.error(error)
        resolve({ error: true })
      })
  })

const extractResponse = (complexData, key) => {
  if (!complexData || complexData.error) return null

  return key ? complexData.response[key] : complexData.response
}

const getDetails = async ({ context, res, offenderNo, prisonApi }) => {
  try {
    return await prisonApi.getDetails(context, offenderNo)
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}

const createFinanceLink = (offenderNo, path, value, showDetailLink) => {
  if (showDetailLink) {
    return `<a href="/prisoner/${offenderNo}/prisoner-finance-details/${path}" class="govuk-link">${
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      formatCurrency(value || 0)
    }</a>`
  }
  return `<p>${
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    formatCurrency(value || 0)
  }</p>`
}

const getNextIepReviewDate = ({ nextReviewDate }: { nextReviewDate?: string }): string | undefined => {
  if (!nextReviewDate) return undefined
  const nextReviewDateMoment = moment(nextReviewDate, 'YYYY-MM-DD HH:mm')
  const reviewDaysOverdue = daysSince(nextReviewDate)
  let nextIepReviewDate = nextReviewDateMoment.format('D MMMM YYYY')
  if (reviewDaysOverdue > 0) {
    nextIepReviewDate += `<br/><span class="highlight highlight--alert">${reviewDaysOverdue} ${
      reviewDaysOverdue === 1 ? 'day' : 'days'
    } overdue</span>`
  }
  return nextIepReviewDate
}

export default ({
    prisonerProfileService,
    prisonApi,
    telemetry,
    systemOauthClient,
    incentivesApi,
    oauthApi,
    restrictedPatientApi,
    adjudicationsApi,
    nonAssociationsApi,
  }: {
    prisonerProfileService
    prisonApi
    telemetry
    systemOauthClient
    incentivesApi: typeof apis.incentivesApi
    oauthApi
    restrictedPatientApi
    adjudicationsApi
    nonAssociationsApi: typeof apis.nonAssociationsApi
  }) =>
  async (req, res) => {
    const {
      user: { activeCaseLoad },
    } = res.locals
    const { offenderNo } = req.params
    const { username } = req.session.userDetails

    const { context, overrideAccess } = await getContext({
      offenderNo,
      res,
      req,
      oauthApi,
      systemOauthClient,
      restrictedPatientApi,
    })
    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)
    const details = await getDetails({ context, prisonApi, res, offenderNo })
    const { bookingId } = details || {}

    const dateThreeMonthsAgo = moment().subtract(3, 'months').format('YYYY-MM-DD')
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
      nonAssociationsResponse,
      visitsSummaryResponse,
      visitBalancesResponse,
      todaysEventsResponse,
    ] = await Promise.all(
      [
        prisonerProfileService.getPrisonerProfileData(context, offenderNo, username, overrideAccess),
        prisonApi.getMainOffence(context, bookingId),
        prisonApi.getPrisonerBalances(context, bookingId),
        prisonApi.getPrisonerDetails(context, offenderNo),
        prisonApi.getPrisonerSentenceDetails(context, offenderNo),
        incentivesApi.getIepSummaryForBooking(systemContext, bookingId),
        prisonApi.getPositiveCaseNotes(context, bookingId, dateThreeMonthsAgo, today),
        prisonApi.getNegativeCaseNotes(context, bookingId, dateThreeMonthsAgo, today),
        adjudicationsApi.getAdjudicationsForBooking(systemContext, bookingId),
        nonAssociationsApi.getNonAssociations(systemContext, offenderNo),
        prisonApi.getVisitsSummary(context, bookingId),
        prisonApi.getPrisonerVisitBalances(context, offenderNo),
        prisonApi.getEventsForToday(context, bookingId),
      ].map((apiCall) => captureErrorAndContinue(apiCall))
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
      prisonerNonAssociations,
      visitsSummary,
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
      nonAssociationsResponse,
      visitsSummaryResponse,
      visitBalancesResponse,
      todaysEventsResponse,
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    ].map((response) => extractResponse(response))

    const prisoner = prisonerData && prisonerData[0]
    const { profileInformation } = prisonerProfileData || {}
    const { morningActivities, afternoonActivities, eveningActivities } = filterActivitiesByPeriod(todaysEvents)
    const unableToShowDetailMessage = 'Unable to show this detail'

    trackEvent(telemetry, username, activeCaseLoad)

    const getLifeImprisonmentLabel = async () => {
      return prisonerProfileData?.indeterminateSentence ? 'Life sentence' : 'Not entered'
    }

    const visitBalancesSection =
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
      visitBalancesResponse.error || (visitBalances && Object.keys(visitBalances).length)
        ? [
            {
              label: 'Remaining visits',
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
              value: visitBalancesResponse.error ? unableToShowDetailMessage : visitBalances.remainingVo,
            },
            {
              label: 'Remaining privileged visits',
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
              value: visitBalancesResponse.error ? unableToShowDetailMessage : visitBalances.remainingPvo,
            },
          ]
        : []

    return res.render('prisonerProfile/prisonerQuickLook/prisonerQuickLook.njk', {
      prisonerProfileData,
      offenceDetailsSectionError: Boolean(
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
        offenceDataResponse.error && prisonerDataResponse.error && sentenceDataResponse.error
      ),
      offenceDetails: [
        {
          label: 'Main offence',
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          value: offenceDataResponse.error
            ? unableToShowDetailMessage
            : (offenceData && offenceData[0] && offenceData[0].offenceDescription) || 'Not entered',
        },
        {
          label: 'Imprisonment status',
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          value: prisonerDataResponse.error
            ? unableToShowDetailMessage
            : (prisoner && prisoner.imprisonmentStatusDesc) || 'Not entered',
        },
        {
          label: 'Release date',
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          value: sentenceDataResponse.error
            ? unableToShowDetailMessage
            : (sentenceData &&
                sentenceData.sentenceDetail &&
                sentenceData.sentenceDetail.releaseDate &&
                moment(sentenceData.sentenceDetail.releaseDate).format('D MMMM YYYY')) ||
              (await getLifeImprisonmentLabel()),
        },
      ],
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
      balanceDetailsSectionError: Boolean(balanceDataResponse.error),
      balanceDetails: [
        {
          label: 'Spends',
          visible: true,
          html: createFinanceLink(
            offenderNo,
            'spends',
            balanceData?.spends,
            prisonerProfileData?.showFinanceDetailLinks
          ),
        },
        {
          label: 'Private cash',
          visible: true,
          html: createFinanceLink(
            offenderNo,
            'private-cash',
            balanceData?.cash,
            prisonerProfileData?.showFinanceDetailLinks
          ),
        },
        {
          label: 'Savings',
          visible: true,
          html: createFinanceLink(
            offenderNo,
            'savings',
            balanceData?.savings,
            prisonerProfileData?.showFinanceDetailLinks
          ),
        },
        {
          label: 'Damage obligations',
          visible: balanceData?.damageObligations > 0,
          html: createFinanceLink(
            offenderNo,
            'damage-obligations',
            balanceData?.damageObligations,
            prisonerProfileData?.showFinanceDetailLinks
          ),
        },
      ],
      incentives: {
        incentivesSectionError: Boolean(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          negativeCaseNotesResponse.error && positiveCaseNotesResponse.error && iepSummaryResponse.error
        ),
        details: [
          {
            label: 'Incentive level warnings',
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
            value: negativeCaseNotesResponse.error
              ? unableToShowDetailMessage
              : (negativeCaseNotes && negativeCaseNotes.count) || 0,
          },
          {
            label: 'Incentive encouragements',
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
            value: positiveCaseNotesResponse.error
              ? unableToShowDetailMessage
              : (positiveCaseNotes && positiveCaseNotes.count) || 0,
          },
          {
            label: 'Next review due by',
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
            html: iepSummaryResponse.error
              ? unableToShowDetailMessage
              : getNextIepReviewDate(iepSummary) ?? unableToShowDetailMessage,
          },
        ],
      },
      adjudications: {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
        adjudicationsSectionError: Boolean(adjudicationsResponse.error),
        active: {
          label: 'Active adjudications',
          ...(adjudications && {
            value:
              adjudications.awards &&
              adjudications.awards
                .map((award) => formatAward(award))
                .filter(({ status }) => status && !status.startsWith('SUSP') && status !== 'QUASHED'),
          }),
        },
        proven: {
          label: 'Proven adjudications',
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          value: adjudicationsResponse.error
            ? unableToShowDetailMessage
            : (adjudications && adjudications.adjudicationCount) || 0,
        },
      },
      nonAssociations: {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
        sectionError: Boolean(nonAssociationsResponse.error),
        prisonerNonAssociations,
        uiUrl: config.apis.nonAssociations.ui_url,
      },
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
      personalDetailsSectionError: Boolean(prisonerDataResponse.error && prisonerProfileDataResponse.error),
      personalDetails: [
        {
          label: 'Age',
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          value: prisonerDataResponse.error
            ? unableToShowDetailMessage
            : prisoner && prisoner.dateOfBirth && moment().diff(moment(prisoner.dateOfBirth), 'years'),
        },
        {
          label: 'Nationality',
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          value: prisonerProfileDataResponse.error
            ? unableToShowDetailMessage
            : getValueByType('NAT', profileInformation, 'resultValue') || 'Not entered',
        },
        {
          label: 'PNC number',
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          value: prisonerDataResponse.error
            ? unableToShowDetailMessage
            : (prisoner && prisoner.pncNumber) || 'Not entered',
        },
        {
          label: 'CRO number',
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
          value: prisonerDataResponse.error
            ? unableToShowDetailMessage
            : (prisoner && prisoner.croNumber) || 'Not entered',
        },
      ],
      visits: {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
        visitSectionError: Boolean(visitBalancesResponse.error && visitsSummaryResponse.error),
        details: [
          ...visitBalancesSection,
          {
            label: 'Next visit date',
            value:
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
              (visitsSummaryResponse.error && unableToShowDetailMessage) ||
              (visitsSummary && visitsSummary.startDateTime
                ? moment(visitsSummary.startDateTime).format('D MMMM YYYY')
                : 'None scheduled'),
          },
        ],
        displayLink: Boolean(visitsSummary && visitsSummary.hasVisits),
      },
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'unknown'.
      scheduledActivityPeriodsSectionError: Boolean(todaysEventsResponse.error),
      scheduledActivityPeriods: [
        { label: 'Morning', value: morningActivities },
        { label: 'Afternoon', value: afternoonActivities },
        { label: 'Evening', value: eveningActivities },
      ],
    })
  }
