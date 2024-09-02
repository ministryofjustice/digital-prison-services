import { getWith404AsNull } from '../utils'
import config from '../config'

export default ({ whereaboutsApi, bookAVideoLinkApi, prisonApi }) => {
  const getVideoLinkBookingFromAppointmentId = async (
    context,
    appointmentId
  ): Promise<{ videoLinkBookingId: number }> => {
    const appointmentDetails = await whereaboutsApi.getAppointment(context, appointmentId)
    const location = await prisonApi.getLocation(context, appointmentDetails.appointment.locationId)

    return appointmentDetails.appointment.appointmentTypeCode === 'VLB' && config.apis.bookAVideoLinkApi.enabled
      ? getWith404AsNull(
          bookAVideoLinkApi.matchAppointmentToVideoLinkBooking(context, appointmentDetails.appointment, location)
        )
      : null
  }

  const deleteVideoLinkBooking = async (context, videoLinkBookingId) =>
    bookAVideoLinkApi.deleteVideoLinkBooking(context, videoLinkBookingId)

  return {
    getVideoLinkBookingFromAppointmentId,
    deleteVideoLinkBooking,
  }
}
