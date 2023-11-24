import { switchDateFormat, sortByDateTime } from '../../utils'
import getExternalEventsForOffenders from '../../shared/getExternalEventsForOffenders'

const offenderNumberMultiMap = (offenderNumbers) =>
  offenderNumbers.reduce((map, offenderNumber) => map.set(offenderNumber, []), new Map())

const sortActivitiesByEventThenByLastName = (data) => {
  data.sort((a, b) => {
    if (a.comment < b.comment) return -1
    if (a.comment > b.comment) return 1

    if (a.lastName < b.lastName) return -1
    if (a.lastName > b.lastName) return 1

    return 0
  })
}

const extractAttendanceInfo = (attendanceInformation, event) => {
  if (attendanceInformation && attendanceInformation.attendances && attendanceInformation.attendances.length > 0) {
    const offenderAttendanceInfo = attendanceInformation.attendances.find(
      (attendance) => attendance.bookingId === event.bookingId && attendance.eventId === event.eventId
    )
    if (!offenderAttendanceInfo) return null

    const { id, absentReason, absentReasonDescription, absentSubReason, attended, paid, comments, locked } =
      offenderAttendanceInfo || {}

    const pay = attended && paid
    const payObject = pay ? { pay } : {}
    return absentReason
      ? {
          id,
          absentReason: { value: absentReason, name: absentReasonDescription },
          absentSubReason,
          comments,
          paid,
          locked,
          other: true,
          ...payObject,
        }
      : { id, comments, paid, locked, ...payObject }
  }

  return null
}

export const getActivityListFactory = (getClientCredentialsTokens, prisonApi, whereaboutsApi) => {
  const getEventsForOffenderNumbers = async ({ agencyId, date, timeSlot, offenderNumbers }) => {
    const systemContext = await getClientCredentialsTokens()
    const searchCriteria = { agencyId, date, timeSlot, offenderNumbers }
    const eventsByKind = await Promise.all([
      prisonApi.getVisits(systemContext, searchCriteria),
      prisonApi.getAppointments(systemContext, searchCriteria),
      prisonApi.getActivities(systemContext, searchCriteria),
    ])
    return [...eventsByKind[0], ...eventsByKind[1], ...eventsByKind[2]] // Meh. No flatMap or flat.
  }

  const getActivityList = async (context, agencyId, locationIdString, frontEndDate, timeSlot) => {
    const locationId = Number.parseInt(locationIdString, 10)

    if (!locationId) {
      throw new Error('Location ID is missing')
    }

    const systemContext = await getClientCredentialsTokens()
    const date = switchDateFormat(frontEndDate)

    const apiParams = { agencyId, locationId, date, timeSlot }
    const eventsAtLocationByUsage = await Promise.all([
      prisonApi.getActivitiesAtLocation(systemContext, { ...apiParams, includeSuspended: true }),
      prisonApi.getActivityList(context, { ...apiParams, usage: 'VISIT' }),
      prisonApi.getActivityList(context, { ...apiParams, usage: 'APP' }),
    ])

    const eventsAtLocation = [
      ...eventsAtLocationByUsage[0],
      ...eventsAtLocationByUsage[1],
      ...eventsAtLocationByUsage[2],
    ] // Meh. No flatMap or flat.

    const offenderNumbersWithDuplicates = eventsAtLocation.map((event) => event.offenderNo)
    const offenderNumbers = [...new Set(offenderNumbersWithDuplicates)]

    const attendanceInformation = await whereaboutsApi.getAttendance(context, {
      agencyId,
      locationId,
      date,
      period: timeSlot,
    })

    const externalEventsForOffenders = await getExternalEventsForOffenders(
      getClientCredentialsTokens,
      prisonApi,
      context,
      {
        offenderNumbers,
        formattedDate: date,
        agencyId,
      }
    )
    const eventsForOffenderNumbers = await getEventsForOffenderNumbers({
      agencyId,
      date,
      timeSlot,
      offenderNumbers,
    })

    const eventsElsewhere = eventsForOffenderNumbers.filter((event) => event.locationId !== locationId)
    const eventsElsewhereByOffenderNumber = offenderNumberMultiMap(offenderNumbers)

    eventsElsewhere.forEach((event) => {
      const events = eventsElsewhereByOffenderNumber.get(event.offenderNo)
      if (events) events.push(event)
    })

    const events = eventsAtLocation.map((event) => {
      const { releaseScheduled, courtEvents, scheduledTransfers, alertFlags, category } =
        externalEventsForOffenders.get(event.offenderNo)

      const eventsElsewhereForOffender = eventsElsewhereByOffenderNumber
        .get(event.offenderNo)
        .sort((left, right) => sortByDateTime(left.startTime, right.startTime))
      const attendanceInfo = extractAttendanceInfo(attendanceInformation, event)

      return {
        ...event,
        eventsElsewhere: eventsElsewhereForOffender,
        releaseScheduled,
        courtEvents,
        scheduledTransfers,
        alertFlags,
        category,
        attendanceInfo,
      }
    })

    sortActivitiesByEventThenByLastName(events)

    return events
  }

  return {
    getActivityList,
  }
}

export default { getActivityListFactory }
