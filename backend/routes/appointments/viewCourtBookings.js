const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { getTime, properCaseName } = require('../../utils')

module.exports = ({ elite2Api, whereaboutsApi, logError }) => async (req, res) => {
  const { date, courtOption } = req.query
  const searchDate = date ? moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
  const agencyId = req.session.userDetails.activeCaseLoadId
  const user = {
    displayName: req.session.userDetails.name,
  }

  try {
    const getCourts = async context => {
      const { courtLocations } = await whereaboutsApi.getCourtLocations(context)

      const courts = courtLocations.sort().reduce((courtList, court) => {
        return { ...courtList, [court]: court }
      }, {})

      return courts
    }

    const [courts, appointments] = await Promise.all([
      getCourts(res.locals),
      elite2Api.getAppointmentsForAgency(res.locals, {
        agencyId,
        date: searchDate,
      }),
    ])

    const videoLinkAppointmentIds = appointments
      .filter(appointment => appointment.appointmentTypeCode === 'VLB')
      .map(videoLinkAppointment => videoLinkAppointment.id)

    const videoLinkAppointmentResponse = await whereaboutsApi.getVideoLinkAppointments(
      res.locals,
      videoLinkAppointmentIds
    )
    const videoLinkAppointments = (videoLinkAppointmentResponse && videoLinkAppointmentResponse.appointments) || []

    const appointmentsEnhanced = videoLinkAppointments
      .filter(videoLink => (courtOption ? videoLink.court === courtOption : true))
      .map(async videoLink => {
        const appointmentData = appointments.find(appointment => appointment.id === videoLink.appointmentId)
        const { startTime, endTime } = appointmentData
        const offenderName = `${properCaseName(appointmentData.firstName)} ${properCaseName(appointmentData.lastName)}`

        return [
          {
            text: endTime ? `${getTime(startTime)} to ${getTime(endTime)}` : getTime(startTime),
          },
          {
            text: offenderName,
          },
          {
            text: appointmentData.locationDescription,
          },
          {
            text: videoLink.court,
          },
        ]
      })

    const appointmentRows = await Promise.all(appointmentsEnhanced)
    const title = `Video link bookings for ${moment(searchDate).format('D MMMM YYYY')}`

    return res.render('viewCourtBookings.njk', {
      courts: Object.keys(courts).map(key => ({ value: key, text: courts[key] })),
      courtOption,
      appointmentRows,
      user,
      homeUrl: '/videolink',
      date: moment(searchDate).format('DD/MM/YYYY'),
      title: courtOption ? `${title} - ${courtOption}` : title,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: '/videolink/bookings' })
  }
}
