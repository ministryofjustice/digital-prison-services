import moment from 'moment'
import { alertFlagLabels, AlertLabelFlag } from '../../shared/alertFlagValues'
import { isoDateTimeEndOfDay, isoDateTimeStartOfDay } from '../../../common/dateHelpers'
import { properCaseName } from '../../utils'
import { SelectValue } from '../../shared/commonTypes'
import { Alert, PrisonerSearchResult } from '../../api/offenderSearchApi'
import { PrisonerPersonalProperty } from '../../api/prisonApi'

const relevantAlertsForTransfer: Array<string> = ['HA', 'HA1', 'XCU', 'XHT', 'PEEP', 'XRF']
const isVideoLinkBooking = (movementReason: string): boolean => movementReason?.startsWith('VL')
const formatPropertyDescription = (description: string): string => description.replace('Property', '').trimStart()

const scheduledTypes: Array<SelectValue> = [
  { text: 'Court', value: 'Court' },
  { text: 'Releases', value: 'Releases' },
  { text: 'Transfers', value: 'Transfers' },
]
type PersonalProperty = {
  containerType: string
  boxNumber: string
}
type ScheduledMovementDetails = {
  prisonerNumber: string
  name: string
  cellLocation: string
  relevantAlertFlagLabels: Array<AlertLabelFlag>
  personalProperty: Array<PersonalProperty>
}

export default ({ prisonApi, offenderSearchApi }) => {
  const renderTemplate = (res, { date, agencyDetails, courtEvents, releaseEvents, transferEvents, scheduledType }) =>
    res.render('whereabouts/scheduledMoves.njk', {
      dateForTitle: moment(date, 'DD/MM/YYYY').format('D MMMM YYYY'),
      agencyDescription: agencyDetails.description,
      formValues: {
        date,
        scheduledType,
      },
      scheduledTypes,
      courtEvents,
      releaseEvents,
      transferEvents,
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
        img: alert.img || null,
        label: alert.label,
        classes: alert.classes,
      }))
  }
  const getScheduledMovementDetails = async (
    context,
    prisonerDetailsForOffenderNumbers: Array<PrisonerSearchResult>
  ): Promise<Array<ScheduledMovementDetails>> => {
    const personalPropertyForPrisoners =
      (await Promise.all(
        prisonerDetailsForOffenderNumbers.flatMap((sr) =>
          prisonApi.getPrisonerProperty(context, sr.bookingId).then((property: Array<PrisonerPersonalProperty>) =>
            property.map((prop) => ({
              containerType: prop.containerType,
              userDescription: formatPropertyDescription(prop.location.userDescription),
              bookingId: sr.bookingId,
              prisonerNumber: sr.prisonerNumber,
            }))
          )
        )
      )) || []

    return prisonerDetailsForOffenderNumbers.map((details) => {
      const personalProperty: Array<PersonalProperty> = personalPropertyForPrisoners
        .flatMap((p) => p)
        .filter((p) => p.prisonerNumber === details.prisonerNumber)
        .map((p) => ({
          containerType: p.containerType,
          boxNumber: p.userDescription,
        }))

      return {
        prisonerNumber: details.prisonerNumber,
        name: `${properCaseName(details.lastName)}, ${properCaseName(details.firstName)} - ${details.prisonerNumber}`,
        cellLocation: details.cellLocation,
        relevantAlertFlagLabels: getRelevantAlertFlagLabels(details.alerts),
        personalProperty,
      }
    })
  }

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

    if (uniqueOffenderNumbers.length === 0) {
      return renderTemplate(res, {
        date,
        agencyDetails,
        scheduledType,
        courtEvents: [],
        releaseEvents: [],
        transferEvents: [],
      })
    }

    const prisonerDetailsForOffenderNumbers: Array<PrisonerSearchResult> = await offenderSearchApi.getPrisonersDetails(
      res.locals,
      uniqueOffenderNumbers
    )

    const scheduledMoveDetailsForPrisoners: Array<ScheduledMovementDetails> = await getScheduledMovementDetails(
      res.locals,
      prisonerDetailsForOffenderNumbers
    )

    const courtEvents = scheduledMovements.courtEvents
      .filter(
        (courtEvent) => (!scheduledType && !isVideoLinkBooking(courtEvent.eventSubType)) || scheduledType === 'Court'
      )
      .map((courtEvent) => ({
        ...scheduledMoveDetailsForPrisoners.find((sr) => sr.prisonerNumber === courtEvent.offenderNo),
        reasonDescription: movementReasons.find((reason) => reason.code === courtEvent.eventSubType)?.description,
        destinationLocationDescription: courtEvent.toAgencyDescription,
      }))

    const releaseEvents = scheduledMovements.releaseEvents
      .filter((_) => !scheduledType || scheduledType === 'Releases')
      .map((re) => ({
        ...scheduledMoveDetailsForPrisoners.find((sr) => sr.prisonerNumber === re.offenderNo),
        reasonDescription: re.movementReasonDescription,
      }))

    const transferEvents = scheduledMovements.transferEvents
      .filter(
        (transfer) => (!scheduledType && !isVideoLinkBooking(transfer.eventSubType)) || scheduledType === 'Transfers'
      )
      .map((transferEvent) => ({
        ...scheduledMoveDetailsForPrisoners.find((sr) => sr.prisonerNumber === transferEvent.offenderNo),
        reasonDescription: movementReasons.find((reason) => reason.code === transferEvent.eventSubType)?.description,
        destinationLocationDescription: transferEvent.toAgencyDescription,
      }))

    return renderTemplate(res, {
      date,
      agencyDetails,
      courtEvents,
      releaseEvents,
      transferEvents,
      scheduledType,
    })
  }

  return {
    index,
  }
}
