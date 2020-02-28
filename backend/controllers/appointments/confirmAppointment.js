const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC } = require('../../../src/dateHelpers')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const { properCaseName } = require('../../utils')
const { serviceUnavailableMessage } = require('../../common-messages')

const { prepostDurations } = require('../../shared/appointmentConstants')
const { toAppointmentDetailsSummary, isVideoLinkBooking } = require('./appointmentsService')

const confirmAppointmentFactory = ({ elite2Api, appointmentsService, logError }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId, authSource } = req.session.userDetails

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
        agencyDescription,
        court,
      } = appointmentDetails.reduce(
        (acc, current) => ({
          ...acc,
          ...current,
        }),
        {}
      )

      const { text: locationDescription } = locationTypes.find(loc => loc.value === Number(locationId))
      const { text: appointmentTypeDescription } = appointmentTypes.find(app => app.value === appointmentType)
      const { text: locationDescriptionForMovementSlip } = (preAppointment &&
        locationTypes.find(loc => loc.value === Number(preAppointment.locationId))) || { text: locationDescription }

      const { firstName, lastName, assignedLivingUnitDesc } = await elite2Api.getDetails(res.locals, offenderNo)

      req.session.appointmentSlipsData = {
        appointmentDetails: {
          comments: comment,
          appointmentTypeDescription,
          locationDescription: locationDescriptionForMovementSlip,
        },
        prisonersListed: [
          {
            firstName: properCaseName(firstName),
            lastName: properCaseName(lastName),
            offenderNo,
            startTime: (preAppointment && preAppointment.startTime) || startTime,
            endTime: (postAppointment && postAppointment.endTime) || endTime,
            assignedLivingUnitDesc,
          },
        ],
      }

      const title = recurring === 'yes' ? 'Appointments booked' : 'Appointment booked'

      const details = toAppointmentDetailsSummary({
        firstName,
        lastName,
        offenderNo,
        appointmentType,
        appointmentTypeDescription,
        location: locationDescription,
        startTime,
        endTime,
        comment,
        recurring,
        times,
        repeats,
        court,
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

        prepostData.legalBriefingBefore =
          (preAppointmentData &&
            `${preAppointmentData.locationDescription} - ${moment(
              preAppointment.startTime,
              DATE_TIME_FORMAT_SPEC
            ).format('HH:mm')} to ${moment(preAppointment.endTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')}`) ||
          'None'

        prepostData.legalBriefingAfter =
          (postAppointmentData &&
            `${postAppointmentData.locationDescription} - ${moment(
              postAppointment.startTime,
              DATE_TIME_FORMAT_SPEC
            ).format('HH:mm')} to ${moment(postAppointment.endTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')}`) ||
          'None'
      }

      if (isVideoLinkBooking(appointmentType)) {
        res.render('videolinkBookingConfirmHearing.njk', {
          title: 'The video link has been created',
          prisonUser: authSource === 'nomis',
          prisonerSearchLink: '/prisoner-search',
          prisonerProfileLink: `${dpsUrl}offenders/${offenderNo}`,
          offender: {
            name: details.prisonerName,
            prison: agencyDescription,
            room: details.location,
          },
          details: {
            date: details.date,
            startTime: details.startTime,
            endTime: details.endTime,
            comments: details.comment,
          },
          prepostData,
          court: {
            courtLocation: details.court,
          },
        })
      } else {
        res.render('confirmAppointments.njk', {
          title,
          addAppointmentsLink: `/offenders/${offenderNo}/add-appointment`,
          prisonerProfileLink: `${dpsUrl}offenders/${offenderNo}`,
          details: {
            ...details,
            ...prepostData,
          },
        })
      }
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk', { url: '/' })
    }
  }
  return { index }
}

module.exports = {
  confirmAppointmentFactory,
}
