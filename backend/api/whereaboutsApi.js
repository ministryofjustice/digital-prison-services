const { arrayToQueryString } = require('../utils')

const whereaboutsApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
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

  return {
    getAttendance,
    getAttendanceForBookings,
    postAttendance,
    putAttendance,
    getAbsenceReasons,
    getPrisonAttendance,
    postAttendances,
  }
}

module.exports = {
  whereaboutsApiFactory,
}
