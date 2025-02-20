import { mapToQueryString } from '../utils'

export const whereaboutsApiFactory = (client) => {
  const processResponse = () => (response) => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
  const getWithCustomTimeout = (context, path, overrides) =>
    client.getWithCustomTimeout(context, path, overrides).then(processResponse())
  const post = (context, url, data) => client.post(context, url, data).then(processResponse())
  const put = (context, url, data) => client.put(context, url, data).then(processResponse())
  const sendDelete = (context, url) => client.sendDelete(context, url).then(processResponse())

  const getAttendance = (context, { agencyId, period, locationId, date }) =>
    get(context, `/attendances/${agencyId}/${locationId}?date=${date}&period=${period}`)

  const getAttendanceForBookings = (context, { agencyId, period, bookings, date }) =>
    post(context, `/attendances/${agencyId}?date=${date}&period=${period}`, bookings)

  const getAttendanceForBookingsOverDateRange = (context, { agencyId, period, bookings, fromDate, toDate }) =>
    post(
      context,
      `/attendances/${agencyId}/attendance-over-date-range?fromDate=${fromDate}&toDate=${toDate}&period=${period}`,
      bookings
    )

  const postAttendance = (context, body) => post(context, '/attendance', body)

  const putAttendance = (context, body, id) => put(context, `/attendance/${id}`, body)

  const getAbsenceReasons = (context) => get(context, '/absence-reasons')

  const prisonersUnaccountedFor = (context, { agencyId, date, period }) =>
    getWithCustomTimeout(context, `/attendances/${agencyId}/unaccounted-for?date=${date}&period=${period}`, {
      customTimeout: 30000,
    })

  const postAttendances = (context, body) => post(context, '/attendances', body)

  const getAttendanceStats = (context, { agencyId, fromDate, toDate, period }) =>
    getWithCustomTimeout(
      context,
      `/attendance-statistics/${agencyId}/over-date-range?fromDate=${fromDate}&toDate=${toDate}&period=${period}`,
      { customTimeout: 30000 }
    )

  const getAbsences = (context, { agencyId, fromDate, toDate, period, reason }) =>
    getWithCustomTimeout(
      context,
      `/attendances/${agencyId}/absences-for-scheduled-activities/${reason}?period=${period}&fromDate=${fromDate}&toDate=${toDate}`,
      { customTimeout: 30000 }
    )

  const getUnacceptableAbsences = (context, offenderNo, fromDate, toDate) =>
    get(context, `/attendances/offender/${offenderNo}/unacceptable-absence-count?fromDate=${fromDate}&toDate=${toDate}`)

  const getUnacceptableAbsenceDetail = (context, offenderNo, fromDate, toDate, page) =>
    get(
      context,
      `/attendances/offender/${offenderNo}/unacceptable-absences?fromDate=${fromDate}&toDate=${toDate}&page=${page}`
    )

  const getAttendanceChanges = (context, { fromDateTime, toDateTime }, agencyId) => {
    const path =
      `/attendances/changes?fromDateTime=${fromDateTime}&toDateTime=${toDateTime}` +
      `${agencyId && `&agencyId=${agencyId}`}`
    return get(context, path)
  }

  const getCellsWithCapacity = (context, { agencyId, groupName, attribute }) => {
    const attributeQuery = attribute ? `?attribute=${attribute}` : ''
    return get(context, `/locations/cellsWithCapacity/${agencyId}/${groupName}${attributeQuery}`)
  }

  const getCellMoveReason = (context, bookingId, bedAssignmentHistorySequence) =>
    get(context, `/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`)

  const moveToCell = (
    context,
    { bookingId, internalLocationDescriptionDestination, cellMoveReasonCode, commentText, offenderNo }
  ) =>
    post(context, `/cell/make-cell-move`, {
      bookingId,
      offenderNo,
      cellMoveReasonCode,
      internalLocationDescriptionDestination,
      commentText,
    })

  const getWhereaboutsConfig = (context, agencyId) => get(context, `/agencies/${agencyId}/locations/whereabouts`)

  const getAppointments = (context, agencyId, { date, locationId, offenderLocationPrefix, timeSlot }) => {
    const searchParams = mapToQueryString({
      date,
      locationId,
      offenderLocationPrefix,
      timeSlot,
    })

    return get(context, `/appointments/${agencyId}?${searchParams}`)
  }

  const createAppointment = (context, appointmentDetails) => post(context, '/appointment', appointmentDetails)
  const deleteAppointment = (context, appointmentEventId) => sendDelete(context, `/appointment/${appointmentEventId}`)
  const deleteRecurringAppointmentSequence = (context, recurringAppointmentSequenceId) =>
    sendDelete(context, `/appointment/recurring/${recurringAppointmentSequenceId}`)
  const getAppointment = (context, id) => get(context, `/appointment/${id}`)

  return {
    getAttendance,
    getAttendanceForBookings,
    getAttendanceForBookingsOverDateRange,
    postAttendance,
    putAttendance,
    getAbsenceReasons,
    prisonersUnaccountedFor,
    postAttendances,
    getAttendanceStats,
    getAbsences,
    getUnacceptableAbsences,
    getUnacceptableAbsenceDetail,
    getAttendanceChanges,
    getCellsWithCapacity,
    moveToCell,
    getCellMoveReason,
    getWhereaboutsConfig,
    getAppointments,
    createAppointment,
    deleteAppointment,
    deleteRecurringAppointmentSequence,
    getAppointment,
  }
}

export default {
  whereaboutsApiFactory,
}
