const { mapToQueryString } = require('../utils')

const whereaboutsApiFactory = (client) => {
  const processResponse = () => (response) => response.body

  const map404ToNull = (error) => {
    if (!error.response) throw error
    if (!error.response.status) throw error
    if (error.response.status !== 404) throw error
    return null
  }

  const get = (context, url) => client.get(context, url).then(processResponse())
  const getWith404AsNull = (context, url) => client.get(context, url).then(processResponse()).catch(map404ToNull)
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

  const getPrisonAttendance = (context, { agencyId, date, period }) =>
    get(context, `/attendances/${agencyId}/attendance-for-scheduled-activities?date=${date}&period=${period}`)

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

  const searchGroups = (context, agencyId) => get(context, `/agencies/${agencyId}/locations/groups`)

  const getAgencyGroupLocationPrefix = (context, agencyId, groupName) =>
    getWith404AsNull(context, `/locations/${agencyId}/${groupName}/location-prefix`)

  const getAgencyGroupLocations = (context, agencyId, groupName) =>
    get(context, `/locations/groups/${agencyId}/${groupName}`)

  const getCourtLocations = (context) => get(context, '/court/courts')

  const addVideoLinkBooking = (context, body) => post(context, '/court/video-link-bookings', body)

  const getVideoLinkAppointments = (context, body) => post(context, '/court/video-link-appointments', body)

  const getAttendanceChanges = (context, { fromDateTime, toDateTime }) =>
    get(context, `/attendances/changes?fromDateTime=${fromDateTime}&toDateTime=${toDateTime}`)

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
    getPrisonAttendance,
    postAttendances,
    getAttendanceStats,
    getAbsences,
    searchGroups,
    getAgencyGroupLocationPrefix,
    getAgencyGroupLocations,
    getCourtLocations,
    addVideoLinkBooking,
    getVideoLinkAppointments,
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

module.exports = {
  whereaboutsApiFactory,
}
