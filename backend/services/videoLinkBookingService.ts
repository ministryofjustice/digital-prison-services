import moment from 'moment'
import { getWith404AsNull } from '../utils'

export default ({ whereaboutsApi, bookAVideoLinkApi, locationsInsidePrisonApi, nomisMapping }) => {
  const getVideoLinkBookingFromAppointmentId = async (
    context,
    appointmentId
  ): Promise<{ videoLinkBookingId: number }> => {
    const appointmentDetails = await whereaboutsApi.getAppointment(context, appointmentId)
    const location = await nomisMapping
      .getNomisLocationMappingByNomisLocationId(context, appointmentDetails.appointment.locationId)
      .then((mapping) => locationsInsidePrisonApi.getLocationById(context, mapping.dpsLocationId))

    return appointmentDetails.appointment.appointmentTypeCode === 'VLB'
      ? getWith404AsNull(
          bookAVideoLinkApi.matchAppointmentToVideoLinkBooking(context, appointmentDetails.appointment, location)
        )
      : null
  }

  const deleteVideoLinkBooking = async (context, videoLinkBookingId) =>
    bookAVideoLinkApi.deleteVideoLinkBooking(context, videoLinkBookingId)

  const bookingIsAmendable = ({ preAppointment, mainAppointment }, bookingStatus) => {
    const now = moment()
    const earliestAppointment = preAppointment || mainAppointment
    const timeOfBooking = moment(
      `${earliestAppointment.appointmentDate} ${earliestAppointment.startTime}`,
      'YYYY-MM-DD HH:mm'
    )

    return bookingStatus !== 'CANCELLED' && timeOfBooking.isAfter(now)
  }

  return {
    getVideoLinkBookingFromAppointmentId,
    deleteVideoLinkBooking,
    bookingIsAmendable,
  }
}
