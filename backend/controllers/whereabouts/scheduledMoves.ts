import moment from 'moment'
import { alertFlagLabels } from '../../shared/alertFlagValues'
import { isoDateTimeEndOfDay, isoDateTimeStartOfDay } from '../../../common/dateHelpers'
import { properCaseName } from '../../utils'

const relevantAlertsForTransfer = ['HA', 'HA1', 'XCU', 'XHT', 'PEEP', 'XRF']
const formatPropertyDescription = (description) => description.replace('Property', '').trimStart()
const sortTextAlphabetically = (left, right) => left.text.localeCompare(right.text)

export default ({ prisonApi, offenderSearchApi }) => {
  const renderTemplate = (res, { date, agencyDetails, movementReasons, courtEvents }) =>
    res.render('whereabouts/scheduledMoves.njk', {
      dateForTitle: moment(date, 'DD/MM/YYYY').format('D MMMM YYYY'),
      agencyDescription: agencyDetails.description,
      formValues: {
        date,
      },
      movementReasons: movementReasons
        .map((values) => ({
          value: values.code,
          text: values.description,
        }))
        .sort(sortTextAlphabetically),
      courtEvents,
    })

  const index = async (req, res) => {
    const { userDetails } = req.session
    const { activeCaseLoadId } = userDetails
    const date = req.query?.date || moment().format('DD/MM/YYYY')

    const [movementReasons, agencyDetails, transfers] = await Promise.all([
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

    const uniqueOffenderNumbers = [
      ...new Set([
        ...transfers.courtEvents.map((ce) => ce.offenderNo),
        ...transfers.transferEvents.map((te) => te.offenderNo),
        ...transfers.releaseEvents.map((re) => re.offenderNo),
      ]),
    ]

    if (uniqueOffenderNumbers.length === 0) {
      return renderTemplate(res, {
        date,
        agencyDetails,
        movementReasons,
        courtEvents: [],
      })
    }

    const prisonerDetailsForOffenderNumbers = await offenderSearchApi.getPrisonersDetails(
      res.locals,
      uniqueOffenderNumbers
    )

    const personalPropertyForPrisoners =
      (await Promise.all(
        prisonerDetailsForOffenderNumbers.flatMap((sr) =>
          prisonApi.getPrisonerProperty(res.locals, sr.bookingId).then((property) =>
            property.map((prop) => ({
              containerType: prop.containerType,
              userDescription: formatPropertyDescription(prop.location.userDescription),
              bookingId: sr.bookingId,
              prisonerNumber: sr.prisonerNumber,
            }))
          )
        )
      )) || []

    const scheduledMoveDetailsForPrisoners = prisonerDetailsForOffenderNumbers.map((details) => {
      const relevantAlertCodesForScheduledMoves = details.alerts
        .map((alert) => alert.alertCode)
        .filter((alert) => relevantAlertsForTransfer.includes(alert))

      const relevantAlertFlagLabels = alertFlagLabels
        .filter((flag) => flag.alertCodes.some((code) => relevantAlertCodesForScheduledMoves.includes(code)))
        .map((alert) => ({
          img: alert.img || null,
          label: alert.label,
          classes: alert.classes,
        }))

      const personalProperty = personalPropertyForPrisoners
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
        relevantAlertFlagLabels,
        personalProperty,
      }
    })

    const courtEvents = transfers.courtEvents.map((courtEvent) => ({
      ...scheduledMoveDetailsForPrisoners.find((sr) => sr.prisonerNumber === courtEvent.offenderNo),
      reasonDescription: movementReasons.find((reason) => reason.code === courtEvent.eventType)?.description,
      destinationLocationDescription: courtEvent.toAgencyDescription,
    }))

    return renderTemplate(res, {
      date,
      agencyDetails,
      movementReasons,
      courtEvents,
    })
  }

  return {
    index,
  }
}
