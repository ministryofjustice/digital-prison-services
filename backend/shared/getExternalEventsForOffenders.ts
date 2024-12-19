import { sortByDateTime, isViewableFlag, isAfterToday } from '../utils'

const getExternalEvents = async (
  getClientCredentialsTokens,
  prisonApi,
  prisonerAlertsApi,
  context,
  { offenderNumbers, agencyId, formattedDate }
) => {
  const systemContext = await getClientCredentialsTokens()
  return Promise.all([
    prisonApi.getSentenceData(context, offenderNumbers),
    prisonApi.getCourtEvents(systemContext, { agencyId, date: formattedDate, offenderNumbers }),
    prisonApi.getExternalTransfers(systemContext, { agencyId, date: formattedDate, offenderNumbers }),
    prisonerAlertsApi.getAlerts(systemContext, { agencyId, offenderNumbers }),
    prisonApi.getAssessments(context, { code: 'CATEGORY', offenderNumbers }),
  ])
}

const releaseScheduled = (releaseScheduledData, offenderNo, formattedDate) =>
  Boolean(
    releaseScheduledData &&
      releaseScheduledData.length &&
      releaseScheduledData.filter(
        (release) =>
          release.offenderNo === offenderNo &&
          release.sentenceDetail.releaseDate === formattedDate &&
          !isAfterToday(formattedDate)
      )[0]
  )

const courtEventStatus = (eventStatus) => {
  switch (eventStatus) {
    case 'SCH':
      return { scheduled: true }
    case 'EXP':
      return { expired: true }
    case 'COMP':
      return { complete: true }
    default:
      return { unCheckedStatus: eventStatus }
  }
}

const toCourtEvent = (event) => ({
  eventId: event.eventId,
  eventDescription: 'Court visit scheduled',
  ...courtEventStatus(event.eventStatus),
})

const latestCompletedCourtEvent = (events) => {
  const courtEvents = events
    .filter((event) => event.eventStatus === 'COMP')
    .sort((left, right) => sortByDateTime(left.startTime, right.startTime))

  const event = courtEvents[courtEvents.length - 1]

  return event && toCourtEvent(event)
}

const getOffenderCourtEvents = (courtEvents, offenderNo, formattedDate) => {
  const events =
    (courtEvents &&
      courtEvents.length &&
      courtEvents.filter((courtEvent) => courtEvent.offenderNo === offenderNo && !isAfterToday(formattedDate))) ||
    []

  const scheduledAndExpiredCourtEvents = events
    .filter((event) => event.eventStatus !== 'COMP')
    .map((event) => toCourtEvent(event))

  const completedEvent = latestCompletedCourtEvent(events)

  if (completedEvent) {
    return [...scheduledAndExpiredCourtEvents, completedEvent]
  }
  return scheduledAndExpiredCourtEvents
}

const transferStatus = (eventStatus) => {
  switch (eventStatus) {
    case 'SCH':
      return { scheduled: true }
    case 'CANC':
      return { cancelled: true }
    case 'EXP':
      return { expired: true }
    case 'COMP':
      return { complete: true }
    default:
      return { unCheckedStatus: eventStatus }
  }
}

const scheduledTransfers = (transfers, offenderNo, formattedDate) =>
  (transfers &&
    transfers.length &&
    transfers
      .filter((transfer) => transfer.offenderNo === offenderNo && !isAfterToday(formattedDate))
      .map((event) => ({
        eventId: event.eventId,
        eventDescription: 'Transfer scheduled',
        ...transferStatus(event.eventStatus),
      }))) ||
  []

const selectAlertFlags = (alertData, offenderNumber) =>
  (alertData &&
    alertData
      .filter(
        (alert) => alert.isActive && alert.prisonNumber === offenderNumber && isViewableFlag(alert.alertCode.code)
      )
      .map((alert) => alert.alertCode.code)) ||
  []

const selectCategory = (assessmentData, offenderNumber) => {
  if (!assessmentData) {
    return ''
  }
  const cat = assessmentData.find((assessment) => assessment.offenderNo === offenderNumber)
  if (!cat) {
    return ''
  }
  return cat.classificationCode
}

const reduceToMap = (
  offenderNumbers,
  formattedDate,
  releaseScheduleData,
  courtEventData,
  transferData,
  alertData,
  assessmentData
) =>
  offenderNumbers.reduce((map, offenderNumber) => {
    const offenderData = {
      releaseScheduled: releaseScheduled(releaseScheduleData, offenderNumber, formattedDate),
      courtEvents: getOffenderCourtEvents(courtEventData, offenderNumber, formattedDate),
      scheduledTransfers: scheduledTransfers(transferData, offenderNumber, formattedDate),
      alertFlags: selectAlertFlags(alertData, offenderNumber),
      category: selectCategory(assessmentData, offenderNumber),
    }
    return map.set(offenderNumber, offenderData)
  }, new Map())

export default async (
  getClientCredentialsTokens,
  prisonApi,
  prisonerAlertsApi,
  context,
  { offenderNumbers, formattedDate, agencyId }
) => {
  if (!offenderNumbers || offenderNumbers.length === 0) return []

  const [releaseScheduleData, courtEventData, transferData, alertData, assessmentData] = await getExternalEvents(
    getClientCredentialsTokens,
    prisonApi,
    prisonerAlertsApi,
    context,
    {
      offenderNumbers,
      agencyId,
      formattedDate,
    }
  )

  return reduceToMap(
    offenderNumbers,
    formattedDate,
    releaseScheduleData,
    courtEventData,
    transferData,
    alertData.content,
    assessmentData
  )
}
