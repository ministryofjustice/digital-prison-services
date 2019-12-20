const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')

const { properCaseName } = require('../utils')
const { serviceUnavailableMessage } = require('../common-messages')

const { prepostDurations } = require('../shared/appointmentConstants')
const { toAppointmentDetailsSummary } = require('../controllers/appointmentsService')

const confirmAppointmentFactory = ({ elite2Api, appointmentsService, logError }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
        res.locals,
        activeCaseLoadId
      )

      const appointmentDetails = req.flash('appointmentDetails')
      if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')

      const {
        locationId,
        appointmentType,
        startTime,
        endTime,
        comment,
        recurring,
        times,
        repeats,
        preAppointment,
        postAppointment,
      } = appointmentDetails[0]

      const { text: locationDescription } = locationTypes.find(loc => loc.value === Number(locationId))
      const { text: appointmentTypeDescription } = appointmentTypes.find(app => app.value === appointmentType)

      const { firstName, lastName, assignedLivingUnitDesc } = await elite2Api.getDetails(res.locals, offenderNo)

      req.flash('appointmentSlipsData', {
        appointmentDetails: {
          startTime,
          endTime,
          comments: comment,
          appointmentTypeDescription,
          locationDescription,
        },
        prisonersListed: [
          {
            firstName: properCaseName(firstName),
            lastName: properCaseName(lastName),
            offenderNo,
            startTime,
            endTime,
            assignedLivingUnitDesc,
          },
        ],
      })

      const title = recurring === 'yes' ? 'Appointments booked' : 'Appointment booked'

      const details = toAppointmentDetailsSummary({
        firstName,
        lastName,
        offenderNo,
        appointmentType: appointmentTypeDescription,
        location: locationDescription,
        startTime,
        endTime,
        comment,
        recurring,
        times,
        repeats,
      })

      const prepostData = {}

      if (appointmentType === 'VLB') {
        const preAppointmentData = preAppointment && {
          locationDescription: locationTypes.find(l => l.value === Number(preAppointment.locationId)).text,
          duration: prepostDurations[preAppointment.duration],
        }
        const postAppointmentData = postAppointment && {
          locationDescription: locationTypes.find(l => l.value === Number(postAppointment.locationId)).text,
          duration: prepostDurations[postAppointment.duration],
        }

        prepostData.preAppointment =
          (preAppointmentData && `${preAppointmentData.locationDescription} - ${preAppointmentData.duration}`) || 'None'

        prepostData.postAppointment =
          (postAppointmentData && `${postAppointmentData.locationDescription} - ${postAppointmentData.duration}`) ||
          'None'
      }

      res.render('confirmAppointments.njk', {
        title,
        addAppointmentsLink: `/offenders/${offenderNo}/add-appointment`,
        prisonerProfileLink: `${dpsUrl}offenders/${offenderNo}`,
        details: {
          ...details,
          ...prepostData,
        },
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk')
    }
  }
  return { index }
}

module.exports = {
  confirmAppointmentFactory,
}
