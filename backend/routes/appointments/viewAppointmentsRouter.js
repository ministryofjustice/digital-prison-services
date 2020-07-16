const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { getTime, properCaseName, formatName, getCurrentPeriod } = require('../../utils')

module.exports = ({ elite2Api, whereaboutsApi, oauthApi, logError }) => async (req, res) => {
  const { date, timeSlot = getCurrentPeriod(), type, locationId } = req.query
  const searchDate = date ? moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
  const agencyId = req.session.userDetails.activeCaseLoadId

  try {
    const [appointmentTypes, appointmentLocations, appointments] = await Promise.all([
      elite2Api.getAppointmentTypes(res.locals),
      elite2Api.getLocationsForAppointments(res.locals, agencyId),
      elite2Api.getAppointmentsForAgency(res.locals, {
        agencyId,
        date: searchDate,
        timeSlot: timeSlot !== 'All' ? timeSlot : undefined,
        locationId,
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
    const videoLinkAppointmentsMadeByTheCourt = videoLinkAppointments.filter(appointment => appointment.madeByTheCourt)

    const videoLinkCourtMappings = videoLinkAppointments
      .filter(appointment => appointment.madeByTheCourt === false)
      .map(appointment => ({
        appointmentId: appointment.appointmentId,
        court: appointment.court,
      }))

    const appointmentsEnhanced = appointments
      .filter(appointment => (type ? appointment.appointmentTypeCode === type : true))
      .map(async appointment => {
        const { startTime, endTime, offenderNo } = appointment
        const offenderName = `${properCaseName(appointment.lastName)}, ${properCaseName(appointment.firstName)}`
        const offenderUrl = `/prisoner/${offenderNo}`

        const videoLinkLocation =
          appointment.appointmentTypeCode === 'VLB' &&
          videoLinkAppointmentsMadeByTheCourt.find(
            videoLinkAppointment => videoLinkAppointment.appointmentId === appointment.id
          )

        const staffDetails =
          !videoLinkLocation &&
          (await elite2Api.getStaffDetails(res.locals, appointment.createUserId).catch(error => {
            logError(req.originalUrl, error, serviceUnavailableMessage)
            return null
          }))

        const createdBy =
          videoLinkLocation &&
          videoLinkLocation.createdByUsername &&
          (await oauthApi.userDetails(res.locals, videoLinkLocation.createdByUsername).catch(error => {
            logError(req.originalUrl, error, serviceUnavailableMessage)
            return null
          }))

        const getAddedBy = () => {
          if (!videoLinkLocation)
            return (staffDetails && formatName(staffDetails.firstName, staffDetails.lastName)) || '--'

          return createdBy ? `${createdBy.name} (court)` : videoLinkLocation.court
        }

        const getCourtDescription = () => {
          if (videoLinkLocation) return `${appointment.locationDescription}</br>with: ${videoLinkLocation.court}`

          const courtMapping = videoLinkCourtMappings.find(mapping => mapping.appointmentId === appointment.id)

          return (
            (courtMapping && `${appointment.locationDescription}</br>with: ${courtMapping.court}`) ||
            appointment.locationDescription
          )
        }

        return [
          {
            text: endTime ? `${getTime(startTime)} to ${getTime(endTime)}` : getTime(startTime),
          },
          {
            html: `<a href="${offenderUrl}" class="govuk-link">${offenderName}</a>`,
            attributes: {
              'data-sort-value': appointment.lastName,
            },
          },
          {
            text: offenderNo,
          },
          {
            text: appointment.appointmentTypeDescription,
          },
          {
            html: getCourtDescription(),
          },
          {
            text: getAddedBy(),
          },
        ]
      })

    const appointmentRows = await Promise.all(appointmentsEnhanced)

    const types = appointmentTypes.map(appointmentType => ({
      text: appointmentType.description,
      value: appointmentType.code,
    }))

    const locations = appointmentLocations.map(appointmentLocation => ({
      text: appointmentLocation.userDescription,
      value: appointmentLocation.locationId,
    }))

    return res.render('viewAppointments.njk', {
      types,
      locations,
      timeSlot,
      type,
      appointmentRows,
      locationId: locationId && Number(locationId),
      date: moment(searchDate).format('DD/MM/YYYY'),
      formattedDate: moment(searchDate).format('D MMMM YYYY'),
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: '/appointments' })
  }
}
