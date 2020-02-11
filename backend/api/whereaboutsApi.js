const whereaboutsApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
  const getWithCustomTimeout = (context, path, overrides) =>
    client.getWithCustomTimeout(context, path, overrides).then(processResponse())
  const post = (context, url, data) => client.post(context, url, data).then(processResponse())
  const put = (context, url, data) => client.put(context, url, data).then(processResponse())

  const getAttendance = (context, { agencyId, period, locationId, date }) =>
    get(context, `/attendances/${agencyId}/${locationId}?date=${date}&period=${period}`)

  const getAttendanceForBookings = (context, { agencyId, period, bookings, date }) =>
    post(context, `/attendances/${agencyId}?date=${date}&period=${period}`, bookings)

  const postAttendance = (context, body) => post(context, '/attendance', body)

  const putAttendance = (context, body, id) => put(context, `/attendance/${id}`, body)

  const getAbsenceReasons = context => get(context, '/absence-reasons')

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

  return {
    getAttendance,
    getAttendanceForBookings,
    postAttendance,
    putAttendance,
    getAbsenceReasons,
    getPrisonAttendance,
    postAttendances,
    getAttendanceStats,
    getAbsences,
    searchGroups,
  }
}

module.exports = {
  whereaboutsApiFactory,
}
