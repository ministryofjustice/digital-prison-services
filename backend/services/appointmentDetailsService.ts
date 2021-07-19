// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'endRecurri... Remove this comment to see the full error message
const { endRecurringEndingDate, repeatTypes } = require('../shared/appointmentConstants')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatName... Remove this comment to see the full error message
const { formatName, getDate, getTime, getWith404AsNull } = require('../utils')

module.exports = ({ prisonApi }) => {
  const getAddedByUser = async (res, appointment) => {
    const staffDetails = await getWith404AsNull(prisonApi.getStaffDetails(res.locals, appointment.createUserId))
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstName' does not exist on type 'unkno... Remove this comment to see the full error message
    return (staffDetails && formatName(staffDetails.firstName, staffDetails.lastName)) || appointment.createUserId
  }

  const getAppointmentViewModel = async (res, appointmentDetails, activeCaseLoadId) => {
    const { appointment, recurring, videoLinkBooking } = appointmentDetails

    const [locationTypes, appointmentTypes] = await Promise.all([
      prisonApi.getLocationsForAppointments(res.locals, activeCaseLoadId),
      prisonApi.getAppointmentTypes(res.locals),
    ])

    const appointmentType = appointmentTypes?.find((type) => type.code === appointment.appointmentTypeCode)
    const locationType = locationTypes?.find((loc) => Number(loc.locationId) === Number(appointment.locationId))

    const lastAppointmentDate =
      recurring &&
      endRecurringEndingDate({
        date: moment(recurring.startTime).format('DD/MM/YYYY'),
        repeats: recurring.repeatPeriod,
        times: recurring.count,
      })

    const prepostData = {}

    const createLocationAndTimeString = (appt) =>
      `${locationTypes.find((loc) => Number(loc.locationId) === Number(appt.locationId)).userDescription} - ${getTime(
        appt.startTime
      )} to ${getTime(appt.endTime)}`

    if (videoLinkBooking?.pre) {
      prepostData['pre-court hearing briefing'] = createLocationAndTimeString(videoLinkBooking.pre)
    }

    if (videoLinkBooking?.post) {
      prepostData['post-court hearing briefing'] = createLocationAndTimeString(videoLinkBooking.post)
    }

    const addedBy = await (videoLinkBooking?.main?.madeByTheCourt ? 'Court' : getAddedByUser(res, appointment))

    const additionalDetails = {
      ...(videoLinkBooking && { courtLocation: videoLinkBooking.main.court }),
      comments: appointment.comment || 'Not entered',
      addedBy,
    }

    const basicDetails = {
      type: appointmentType?.description,
      location: locationType?.userDescription,
      date: getDate(appointment.startTime, 'D MMMM YYYY'),
    }

    const timeDetails = {
      startTime: getTime(appointment.startTime),
      endTime: (appointment.endTime && getTime(appointment.endTime)) || 'Not entered',
    }

    const recurringDetails = !videoLinkBooking && {
      recurring: recurring ? 'Yes' : 'No',
      ...(recurring && {
        repeats: repeatTypes.find((repeat) => repeat.value === recurring.repeatPeriod).text,
        lastAppointment: getDate(lastAppointmentDate.endOfPeriod, 'D MMMM YYYY'),
      }),
    }

    return {
      isRecurring: !!recurring,
      additionalDetails,
      basicDetails,
      prepostData,
      recurringDetails,
      timeDetails,
    }
  }

  return {
    getAppointmentViewModel,
  }
}
