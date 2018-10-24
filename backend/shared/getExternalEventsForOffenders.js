const { sortByDateTime } = require('../utils')

const getExternalEvents = (elite2Api, context, { offenderNumbers, agencyId, formattedDate }) =>
  Promise.all([
    elite2Api.getSentenceData(context, offenderNumbers),
    elite2Api.getCourtEvents(context, { agencyId, date: formattedDate, offenderNumbers }),
    elite2Api.getExternalTransfers(context, { agencyId, date: formattedDate, offenderNumbers }),
  ])

const releaseScheduled = (releaseScheduledData, offenderNo, formattedDate) =>
  Boolean(
    releaseScheduledData &&
      releaseScheduledData.length &&
      releaseScheduledData.filter(
        release => release.offenderNo === offenderNo && release.sentenceDetail.releaseDate === formattedDate
      )[0]
  )

const courtEventStatus = eventStatus => {
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

const toCourtEvent = event => ({
  eventId: event.eventId,
  eventDescription: 'Court visit scheduled',
  ...courtEventStatus(event.eventStatus),
})

const latestCompletedCourtEvent = events => {
  const courtEvents = events
    .filter(event => event.eventStatus === 'COMP')
    .sort((left, right) => sortByDateTime(left.startTime, right.startTime))

  const event = courtEvents[courtEvents.length - 1]

  return event && toCourtEvent(event)
}

const courtEvents = (courtEvents, offenderNo) => {
  const events =
    (courtEvents && courtEvents.length && courtEvents.filter(courtEvent => courtEvent.offenderNo === offenderNo)) || []

  const scheduledAndExpiredCourtEvents = events
    .filter(event => event.eventStatus !== 'COMP')
    .map(event => toCourtEvent(event))

  const completedEvent = latestCompletedCourtEvent(events)

  if (completedEvent) {
    return [...scheduledAndExpiredCourtEvents, completedEvent]
  }
  return scheduledAndExpiredCourtEvents
}

const transferStatus = eventStatus => {
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

const scheduledTransfers = (transfers, offenderNo) =>
  (transfers &&
    transfers.length &&
    transfers.filter(transfer => transfer.offenderNo === offenderNo).map(event => ({
      eventId: event.eventId,
      eventDescription: 'Transfer scheduled',
      ...transferStatus(event.eventStatus),
    }))) ||
  []

const reduceToMap = (offenderNumbers, formattedDate, releaseScheduleData, courtEventData, transferData) =>
  offenderNumbers.reduce((map, offenderNumber) => {
    const offenderData = {
      releaseScheduled: releaseScheduled(releaseScheduleData, offenderNumber, formattedDate),
      courtEvents: courtEvents(courtEventData, offenderNumber),
      scheduledTransfers: scheduledTransfers(transferData, offenderNumber),
    }
    return map.set(offenderNumber, offenderData)
  }, new Map())

module.exports = async (elite2Api, context, { offenderNumbers, formattedDate, agencyId }) => {
  if (!offenderNumbers || offenderNumbers.length === 0) return []

  const [releaseScheduleData, courtEventData, transferData] = await getExternalEvents(elite2Api, context, {
    offenderNumbers,
    agencyId,
    formattedDate,
  })

  return reduceToMap(offenderNumbers, formattedDate, releaseScheduleData, courtEventData, transferData)
}
