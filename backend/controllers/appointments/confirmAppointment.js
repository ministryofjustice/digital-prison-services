const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC } = require('../../../src/dateHelpers')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

const { properCaseName } = require('../../utils')
const { serviceUnavailableMessage } = require('../../common-messages')

const { prepostDurations } = require('../../shared/appointmentConstants')
const { toAppointmentDetailsSummary, isVideoLinkBooking } = require('../../services/appointmentsService')

const confirmAppointmentFactory = ({ elite2Api, appointmentsService, logError }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId, authSource } = req.session.userDetails
    const prisonUser = authSource === 'nomis'

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

        if (preAppointmentData) {
          prepostData['pre-court hearing briefing'] = `${preAppointmentData.locationDescription} - ${moment(
            preAppointment.startTime,
            DATE_TIME_FORMAT_SPEC
          ).format('HH:mm')} to ${moment(preAppointment.endTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')}`
        }

        if (postAppointmentData) {
          prepostData['post-court hearing briefing'] = `${postAppointmentData.locationDescription} - ${moment(
            postAppointment.startTime,
            DATE_TIME_FORMAT_SPEC
          ).format('HH:mm')} to ${moment(postAppointment.endTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')}`
        }
      }

      if (isVideoLinkBooking(appointmentType)) {
        res.render('videolinkBookingConfirmHearing.njk', {
          title: 'The video link has been booked',
          prisonUser,
          prisonerSearchLink: '/prisoner-search',
          prisonerProfileLink: `${dpsUrl}offenders/${offenderNo}`,
          offender: {
            name: details.prisonerName,
            prison: agencyDescription,
            prisonRoom: details.location,
          },
          details: {
            date: details.date,
            courtHearingStartTime: details.startTime,
            courtHearingEndTime: details.endTime,
            comments: details.comment,
          },
          prepostData,
          court: {
            courtLocation: details.court,
          },
          homeUrl: prisonUser ? dpsUrl : '/videolink',
        })

        raiseAnalyticsEvent(
          'VLB Appointments',
          `Video link booked for ${details.court}`,
          `Pre: ${preAppointment ? 'Yes' : 'No'} | Post: ${postAppointment ? 'Yes' : 'No'}`
        )
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
      const pageData = {
        url: prisonUser ? `${dpsUrl}offenders/${offenderNo}` : '/prisoner-search',
        homeUrl: prisonUser ? dpsUrl : '/videolink',
      }
      if (prisonUser) {
        res.render('error.njk', pageData)
      } else {
        res.render('courtServiceError.njk', pageData)
      }
    }
  }
  return { index }
}

module.exports = {
  confirmAppointmentFactory,
}
