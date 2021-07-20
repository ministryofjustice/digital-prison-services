// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DATE_TIME_... Remove this comment to see the full error message
const { DATE_TIME_FORMAT_SPEC } = require('../../../common/dateHelpers')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'raiseAnaly... Remove this comment to see the full error message
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'properCase... Remove this comment to see the full error message
const { properCaseName, formatName } = require('../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'serviceUna... Remove this comment to see the full error message
const { serviceUnavailableMessage } = require('../../common-messages')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prepostDur... Remove this comment to see the full error message
const { prepostDurations } = require('../../shared/appointmentConstants')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'toAppointm... Remove this comment to see the full error message
const { toAppointmentDetailsSummary, isVideoLinkBooking } = require('../../services/appointmentsService')

const confirmAppointmentFactory = ({ prisonApi, appointmentsService, logError }) => {
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
      if (!appointmentDetails?.length) {
        res.redirect(prisonUser ? `/prisoner/${offenderNo}` : '/videolink/prisoner-search')
        return
      }

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

      const { text: locationDescription } = locationTypes.find((loc) => loc.value === Number(locationId))
      const { text: appointmentTypeDescription } = appointmentTypes.find((app) => app.value === appointmentType)
      const { text: locationDescriptionForMovementSlip } = (preAppointment &&
        locationTypes.find((loc) => loc.value === Number(preAppointment.locationId))) || { text: locationDescription }

      const { firstName, lastName, assignedLivingUnitDesc } = await prisonApi.getDetails(res.locals, offenderNo)

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
            startTime: preAppointment?.startTime ?? startTime,
            endTime: postAppointment?.endTime ?? endTime,
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
            locationDescription: locationTypes.find((l) => l.value === Number(preAppointment.locationId)).text,
            duration: prepostDurations[preAppointment.duration],
          }
        const postAppointmentData = postAppointment &&
          postAppointment.locationId && {
            locationDescription: locationTypes.find((l) => l.value === Number(postAppointment.locationId)).text,
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
            prisonerProfileLink: `/prisoner/${offenderNo}`,
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

        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
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
          prisonerProfileLink: `/prisoner/${offenderNo}`,
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
        url: prisonUser ? `/prisoner/${offenderNo}` : '/videolink/prisoner-search',
        homeUrl: prisonUser ? '/' : '/videolink',
      }

      res.status(500)

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
