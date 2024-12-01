import moment from 'moment'
import { getWith404AsNull } from '../utils'
import config from '../config'

export default ({ whereaboutsApi, bookAVideoLinkApi, locationsInsidePrisonApi, nomisMapping }) => {
  const getVideoLinkBookingFromAppointmentId = async (
    context,
    appointmentId
  ): Promise<{ videoLinkBookingId: number }> => {
    const appointmentDetails = await whereaboutsApi.getAppointment(context, appointmentId)
    const location = await nomisMapping
      .getNomisLocationMappingByNomisLocationId(context, appointmentDetails.appointment.locationId)
      .then((mapping) => locationsInsidePrisonApi.getLocationById(context, mapping.dpsLocationId))

    return appointmentDetails.appointment.appointmentTypeCode === 'VLB' && config.apis.bookAVideoLinkApi.enabled
      ? getWith404AsNull(
          bookAVideoLinkApi.matchAppointmentToVideoLinkBooking(context, appointmentDetails.appointment, location)
        )
      : null
  }

  const deleteVideoLinkBooking = async (context, videoLinkBookingId) =>
    bookAVideoLinkApi.deleteVideoLinkBooking(context, videoLinkBookingId)

  const bookingIsAmendable = (timeOfBooking, bookingStatus) => {
    const now = moment()
    return bookingStatus !== 'CANCELLED' && moment(timeOfBooking).isAfter(now)
  }

  return {
    getVideoLinkBookingFromAppointmentId,
    deleteVideoLinkBooking,
    bookingIsAmendable,
  }
}
