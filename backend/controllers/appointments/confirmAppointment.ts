import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../../common/dateHelpers'
import { raiseAnalyticsEvent } from '../../raiseAnalyticsEvent'
import { properCaseName, formatName } from '../../utils'
import { serviceUnavailableMessage } from '../../common-messages'
import { prepostDurations } from '../../shared/appointmentConstants'
import { toAppointmentDetailsSummary, isVideoLinkBooking } from '../../services/appointmentsService'

export const confirmAppointmentFactory = ({ prisonApi, appointmentsService, logError }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
        res.locals,
        activeCaseLoadId
      )

      const appointmentDetails = req.flash('appointmentDetails')
      if (!appointmentDetails?.length) {
        res.redirect(`/prisoner/${offenderNo}`)
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

      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ firstName: any; lastName: any;... Remove this comment to see the full error message
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
          homeUrl: '/',
        })

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
        url: `/prisoner/${offenderNo}`,
        homeUrl: '/',
      }

      res.status(500)
      res.render('error.njk', pageData)
    }
  }
  return { index }
}

export default {
  confirmAppointmentFactory,
}
