const { arrayToQueryString } = require('../utils')

const whereaboutsApiFactory = client => {
  const processResponse = () => response => response.data

  const get = (context, url) => client.get(context, url).then(processResponse())
  const post = (context, url, data) => client.post(context, url, data).then(processResponse())
  const put = (context, url, data) => client.put(context, url, data).then(processResponse())

  const getAttendance = (context, { agencyId, period, locationId, date }) =>
    get(context, `/attendance/${agencyId}/${locationId}?date=${date}&period=${period}`)

  const getAttendanceForBookings = (context, { agencyId, period, bookings, date }) =>
    get(context, `/attendance/${agencyId}?${arrayToQueryString(bookings, 'bookings')}&date=${date}&period=${period}`)

  const postAttendance = (context, body) => post(context, '/attendance', body)

  const putAttendance = (context, body, id) => put(context, `/attendance/${id}`, body)

  const getAbsenceReasons = context => get(context, '/attendance/absence-reasons')

  const getPrisonAttendance = (context, { agencyId, date, period }) =>
    get(context, `/attendance/${agencyId}/attendance-for-scheduled-activities?date=${date}&period=${period}`)
  const attendAll = (context, body) => post(context, '/attendance/attend-all', body)

  return {
    getAttendance,
    getAttendanceForBookings,
    postAttendance,
    putAttendance,
    getAbsenceReasons,
    getPrisonAttendance,
    attendAll,
  }
}

module.exports = {
  whereaboutsApiFactory,
}
