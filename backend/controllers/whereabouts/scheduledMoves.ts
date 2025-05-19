import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { alertFlagLabels, AlertLabelFlag } from '../../shared/alertFlagValues'
import { isoDateTimeEndOfDay, isoDateTimeStartOfDay } from '../../../common/dateHelpers'
import { formatName, properCaseName } from '../../utils'
import { SelectValue } from '../../shared/commonTypes'
import { Alert, PrisonerSearchResult } from '../../api/offenderSearchApi'
import { PrisonerPersonalProperty } from '../../api/prisonApi'
import config from '../../config'

const {
  apis: { activities, appointments },
} = config

const scheduledTypes: Array<SelectValue> = [
  { text: 'Court appearances', value: 'Court' },
  { text: 'Releases', value: 'Releases' },
  { text: 'Transfers', value: 'Transfers' },
]

type PersonalProperty = {
  containerType: string
  boxNumber: string
}
type HoldAgainstTransferAlertDetails = {
  description: string
  comments: string
  dateAdded: string
  createdBy: string
}
type HoldAgainstTransferAlerts = {
  prisonerNumber: string
  displayId: string
  fullName: string
  alerts: Array<HoldAgainstTransferAlertDetails>
}
type ScheduledMovementDetails = {
  prisonerNumber: string
  name: string
  cellLocation: string
  relevantAlertFlagLabels: Array<AlertLabelFlag>
  personalProperty: Array<PersonalProperty>
}
type Event = {
  prisonerNumber: string
}

const relevantAlertsForTransfer: Array<string> = ['HA', 'HA1', 'XCU', 'XHT', 'PEEP', 'XRF']
const relevantAlertsForHoldAgainstTransfer: Array<string> = ['TAP', 'TAH', 'TCPA', 'TG', 'TM', 'TPR', 'TSE']
const isVideoLinkBooking = (movementReason: string): boolean => movementReason?.startsWith('VL')
const formatPropertyDescription = (description: string): string =>
  description?.replace('Property', '').trimStart() || 'None'
const formatCellLocation = (cellLocation: string): string =>
  cellLocation?.replace('CSWAP', 'No cell allocated') || 'None'
const isScheduled = (eventStatus: string): boolean => eventStatus === 'SCH'

const countResultsOncePerPrisonerNumber = (events: Event[]): number =>
  [...new Set(events.flatMap((event) => event.prisonerNumber))].length

const onlyActiveIn = (result: PrisonerSearchResult): boolean => result?.status === 'ACTIVE IN'

export default ({ prisonApi, prisonerAlertsApi, offenderSearchApi, systemOauthClient }) => {
  const renderTemplate = (
    res,
    { date, agencyDetails, courtEvents, releaseEvents, transferEvents, scheduledType, isActivitiesEnabled }
  ) =>
    res.render('whereabouts/scheduledMoves.njk', {
      isActivitiesEnabled,
      dateForTitle: moment(date, 'DD/MM/YYYY').format('D MMMM YYYY'),
      agencyDescription: agencyDetails.description,
      formValues: {
        date,
        scheduledType,
      },
      scheduledTypes,
      courtEvents,
      prisonersListedForCourt: countResultsOncePerPrisonerNumber(courtEvents),
      releaseEvents,
      prisonersListedForRelease: countResultsOncePerPrisonerNumber(releaseEvents),
      transferEvents,
      prisonersListedForTransfer: countResultsOncePerPrisonerNumber(transferEvents),
      showCourtAppearances: !scheduledType || scheduledType === 'Court',
      showReleases: !scheduledType || scheduledType === 'Releases',
      showTransfers: !scheduledType || scheduledType === 'Transfers',
    })

  const getRelevantAlertFlagLabels = (alerts: Array<Alert>): Array<AlertLabelFlag> => {
    const relevantAlertCodesForScheduledMoves: Array<string> = alerts
      .map((alert) => alert.alertCode)
      .filter((alert) => relevantAlertsForTransfer.includes(alert))

    return alertFlagLabels
      .filter((flag) => flag.alertCodes.some((code) => relevantAlertCodesForScheduledMoves.includes(code)))
      .map((alert) => ({
        label: alert.label,
        classes: alert.classes,
      }))
  }

  const getHoldAgainstTransferAlertDetails = async (
    systemContext,
    prisonerDetails: PrisonerSearchResult
  ): Promise<HoldAgainstTransferAlerts | null> => {
    const activeHoldAgainstTransferAlerts = prisonerDetails.alerts.filter((alert) =>
      relevantAlertsForHoldAgainstTransfer.includes(alert.alertCode)
    )

    if (activeHoldAgainstTransferAlerts.length === 0) {
      return null
    }

    const holdAgainstTransferAlertDetails = (
      await prisonerAlertsApi.getAlertsForLatestBooking(systemContext, {
        prisonNumber: prisonerDetails.prisonerNumber,
        alertCodes: relevantAlertsForHoldAgainstTransfer,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      })
    ).content

    const activeHoldAgainstTransferAlertDetails = holdAgainstTransferAlertDetails.filter((a) => a.isActive)

    if (activeHoldAgainstTransferAlertDetails.length === 0) {
      return null
    }

    return {
      prisonerNumber: prisonerDetails.prisonerNumber,
      displayId: uuidv4(),
      fullName: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
      alerts: activeHoldAgainstTransferAlertDetails.map((alertDetails) => ({
        description: `${alertDetails.alertCode.description} (${alertDetails.alertCode.code})`,
        comments: alertDetails.description,
        dateAdded: moment(alertDetails.createdAt, 'YYYY-MM-DD').format('D MMMM YYYY'),
        createdBy: alertDetails.createdByDisplayName,
      })),
    }
  }

  const getScheduledMovementDetails = async (
    context,
    systemContext,
    prisonerDetailsForOffenderNumbers: Array<PrisonerSearchResult>
  ): Promise<Array<ScheduledMovementDetails>> => {
    const personalPropertyForPrisoners =
      (await Promise.all(
        prisonerDetailsForOffenderNumbers.flatMap((sr) =>
          prisonApi.getPrisonerProperty(context, sr.bookingId).then((property: Array<PrisonerPersonalProperty>) =>
            property.map((prop) => ({
              containerType: prop.containerType,
              userDescription: formatPropertyDescription(prop?.location?.userDescription),
              bookingId: sr.bookingId,
              prisonerNumber: sr.prisonerNumber,
            }))
          )
        )
      )) || []

    const holdAgainstTransferAlertsForPrisoners =
      (await Promise.all(
        prisonerDetailsForOffenderNumbers.flatMap((sr) => getHoldAgainstTransferAlertDetails(systemContext, sr))
      )) || []

    return prisonerDetailsForOffenderNumbers.map((details) => {
      const personalProperty: Array<PersonalProperty> = personalPropertyForPrisoners
        .flatMap((p) => p)
        .filter((p) => p?.prisonerNumber === details.prisonerNumber)
        .map((p) => ({
          containerType: p.containerType,
          boxNumber: p.userDescription,
        }))

      const holdAgainstTransferAlerts: HoldAgainstTransferAlerts = holdAgainstTransferAlertsForPrisoners.find(
        (p) => p && p.prisonerNumber === details.prisonerNumber
      )

      return {
        prisonerNumber: details.prisonerNumber,
        name: `${properCaseName(details.lastName)}, ${properCaseName(details.firstName)} - ${details.prisonerNumber}`,
        cellLocation: formatCellLocation(details.cellLocation),
        relevantAlertFlagLabels: getRelevantAlertFlagLabels(details.alerts),
        holdAgainstTransferAlerts,
        personalProperty,
      }
    })
  }

  const toScheduledEventWithADestination = ({
    events,
    prisonerNumbersForOffenderNumbersThatAreOutside,
    scheduledMoveDetailsForPrisoners,
    movementReasons,
  }) =>
    events
      .filter((event) => !prisonerNumbersForOffenderNumbersThatAreOutside.includes(event.offenderNo))
      .filter((event) => !isVideoLinkBooking(event.eventSubType) && isScheduled(event.eventStatus))
      .map((event) => ({
        ...scheduledMoveDetailsForPrisoners.find((sr) => sr.prisonerNumber === event.offenderNo),
        reasonDescription: movementReasons.find((reason) => reason.code === event.eventSubType)?.description,
        destinationLocationDescription: event.toAgencyDescription,
      }))
      .sort((left, right) => left.name?.localeCompare(right.name))

  const index = async (req, res) => {
    const { userDetails } = req.session
    const { activeCaseLoadId } = userDetails
    const date = req.query?.date || moment().format('DD/MM/YYYY')
    const { scheduledType } = req.query

    const [movementReasons, agencyDetails, scheduledMovements] = await Promise.all([
      prisonApi.getMovementReasons(res.locals),
      prisonApi.getAgencyDetails(res.locals, activeCaseLoadId),
      prisonApi.getTransfers(res.locals, {
        fromDateTime: isoDateTimeStartOfDay(date, 'DD/MM/YYYY'),
        toDateTime: isoDateTimeEndOfDay(date, 'DD/MM/YYYY'),
        agencyId: activeCaseLoadId,
        courtEvents: true,
        transferEvents: true,
        releaseEvents: true,
      }),
    ])

    const uniqueOffenderNumbers: Array<string> = [
      ...new Set([
        ...scheduledMovements.courtEvents.map((ce) => ce.offenderNo),
        ...scheduledMovements.transferEvents.map((te) => te.offenderNo),
        ...scheduledMovements.releaseEvents.map((re) => re.offenderNo),
      ]),
    ]

    const isActivitiesEnabled = () =>
      activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
      appointments.enabled_prisons.split(',').includes(activeCaseLoadId)

    if (uniqueOffenderNumbers.length === 0) {
      return renderTemplate(res, {
        date,
        agencyDetails,
        scheduledType,
        courtEvents: [],
        releaseEvents: [],
        transferEvents: [],
        isActivitiesEnabled: isActivitiesEnabled(),
      })
    }

    const prisonerDetailsForOffenderNumbers: Array<PrisonerSearchResult> = await offenderSearchApi.getPrisonersDetails(
      res.locals,
      uniqueOffenderNumbers
    )

    const prisonerDetailsForOffenderNumbersThatAreActivelyInside =
      prisonerDetailsForOffenderNumbers.filter(onlyActiveIn)

    const systemContext = await systemOauthClient.getClientCredentialsTokens(
      res.locals?.user?.username || 'legacy-dps-user'
    )

    const scheduledMoveDetailsForPrisoners: Array<ScheduledMovementDetails> = await getScheduledMovementDetails(
      res.locals,
      systemContext,
      prisonerDetailsForOffenderNumbersThatAreActivelyInside
    )

    const prisonerNumbersForOffenderNumbersThatAreOutside = prisonerDetailsForOffenderNumbers
      .filter((r) => !onlyActiveIn(r))
      .map((r) => r.prisonerNumber)

    const allCourtEvents = scheduledType && scheduledType !== 'Court' ? [] : scheduledMovements.courtEvents
    const courtEvents = toScheduledEventWithADestination({
      events: allCourtEvents,
      prisonerNumbersForOffenderNumbersThatAreOutside,
      scheduledMoveDetailsForPrisoners,
      movementReasons,
    })

    const allTransferEvents = scheduledType && scheduledType !== 'Transfers' ? [] : scheduledMovements.transferEvents
    const transferEventsWithoutRotl = allTransferEvents.filter((transferEvent) => transferEvent.eventType !== 'TAP')
    const transferEvents = toScheduledEventWithADestination({
      events: transferEventsWithoutRotl,
      prisonerNumbersForOffenderNumbersThatAreOutside,
      scheduledMoveDetailsForPrisoners,
      movementReasons,
    })

    const allReleaseEvents = scheduledType && scheduledType !== 'Releases' ? [] : scheduledMovements.releaseEvents
    const releaseEvents = allReleaseEvents
      .filter((releaseEvent) => !prisonerNumbersForOffenderNumbersThatAreOutside.includes(releaseEvent.offenderNo))
      .filter((releaseEvent) => isScheduled(releaseEvent.eventStatus))
      .map((re) => ({
        ...scheduledMoveDetailsForPrisoners.find((sr) => sr.prisonerNumber === re.offenderNo),
        reasonDescription: re.movementReasonDescription,
      }))

    return renderTemplate(res, {
      date,
      agencyDetails,
      courtEvents,
      releaseEvents,
      transferEvents,
      scheduledType,
      isActivitiesEnabled: isActivitiesEnabled(),
    })
  }

  return {
    index,
  }
}
