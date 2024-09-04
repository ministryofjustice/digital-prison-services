import moment from 'moment'

export const bookAVideoLinkApiFactory = (client) => {
  const processResponse = () => (response) => response.body

  const post = (systemContext, url, data) => client.post(systemContext, url, data).then(processResponse())
  const sendDelete = (systemContext, url) => client.sendDelete(systemContext, url).then(processResponse())

  const matchAppointmentToVideoLinkBooking = (systemContext, { offenderNo, startTime, endTime }, { locationPrefix }) =>
    post(systemContext, `/video-link-booking/search`, {
      prisonerNumber: offenderNo,
      locationKey: locationPrefix,
      date: moment(startTime).format('YYYY-MM-DD'),
      startTime: moment(startTime).format('HH:mm'),
      endTime: moment(endTime).format('HH:mm'),
    })

  const deleteVideoLinkBooking = (systemContext, videoLinkBookingId) =>
    sendDelete(systemContext, `/video-link-booking/id/${videoLinkBookingId}`)

  return {
    matchAppointmentToVideoLinkBooking,
    deleteVideoLinkBooking,
  }
}

export default {
  bookAVideoLinkApiFactory,
}
