const moment = require('moment')

const { DATE_TIME_FORMAT_SPEC } = require('../../../src/dateHelpers')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

const { properCaseName, formatName } = require('../../utils')
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
        const preAppointmentData = preAppointment &&
          preAppointment.locationId && {
            locationDescription: locationTypes.find(l => l.value === Number(preAppointment.locationId)).text,
            duration: prepostDurations[preAppointment.duration],
          }
        const postAppointmentData = postAppointment &&
          postAppointment.locationId && {
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
        if (prisonUser) {
          res.render('videolinkBookingConfirmHearingPrison.njk', {
            title: 'The video link has been booked',
            prisonerProfileLink: `${dpsUrl}offenders/${offenderNo}`,
            offender: {
              name: `${properCaseName(lastName)}, ${properCaseName(firstName)}`,
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
          })
        } else {
          res.render('videolinkBookingConfirmHearingCourt.njk', {
            title: 'The video link has been booked',
            videolinkPrisonerSearchLink: '/videolink/prisoner-search',
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
            homeUrl: '/videolink',
          })
        }

        raiseAnalyticsEvent(
          'VLB Appointments',
          `Video link booked for ${details.court}`,
          `Pre: ${preAppointment ? 'Yes' : 'No'} | Post: ${postAppointment ? 'Yes' : 'No'}`
        )
      } else {
        const recurringData = details.recurring === 'Yes' && {
          recurring: 'Yes',
          repeats: details.howOften,
          numberAdded: details.numberOfAppointments,
          lastAppointment: details.endDateShortFormat,
        }

        res.render('confirmAppointments.njk', {
          addAppointmentsLink: `/offenders/${offenderNo}/add-appointment`,
          prisonerName: formatName(firstName, lastName),
          prisonerProfileLink: `${dpsUrl}offenders/${offenderNo}`,
          details: {
            type: details.appointmentType,
            location: details.location,
            date: details.date,
            startTime: details.startTime,
            endTime: details.endTime,
            ...recurringData,
            comment: details.comment,
          },
        })
      }
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      const pageData = {
        url: prisonUser ? `${dpsUrl}offenders/${offenderNo}` : '/videolink/prisoner-search',
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
