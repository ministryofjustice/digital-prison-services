const moment = require('moment')
const { endRecurringEndingDate, repeatTypes } = require('../shared/appointmentConstants')
const { formatName, getDate, getTime } = require('../utils')

module.exports = ({ prisonApi, whereaboutsApi }) => async (req, res) => {
  const { id } = req.params
  const { activeCaseLoadId } = req.session.userDetails

  const appointmentDetails = await whereaboutsApi.getAppointment(res.locals, id)

  const { appointment, recurring, videoLinkBooking } = appointmentDetails

  const [prisonerDetails, locationTypes, appointmentTypes, staffDetails] = await Promise.all([
    prisonApi.getDetails(res.locals, appointment.offenderNo),
    prisonApi.getLocationsForAppointments(res.locals, activeCaseLoadId),
    prisonApi.getAppointmentTypes(res.locals),
    prisonApi.getStaffDetails(res.locals, appointment.createUserId),
  ])

  const appointmentType = appointmentTypes?.find(type => type.code === appointment.appointmentTypeCode)
  const locationType = locationTypes?.find(loc => Number(loc.locationId) === Number(appointment.locationId))

  const lastAppointmentDate =
    recurring &&
    endRecurringEndingDate({
      date: moment(appointment.startTime).format('DD/MM/YYYY'),
      repeats: recurring.repeatPeriod,
      times: recurring.count,
    })

  const prepostData = {}

  const createLocationAndTimeString = appt =>
    `${locationTypes.find(loc => Number(loc.locationId) === Number(appt.locationId)).userDescription} - ${getTime(
      appt.startTime
    )} to ${getTime(appt.endTime)}`

  if (videoLinkBooking?.pre) {
    prepostData['pre-court hearing briefing'] = createLocationAndTimeString(videoLinkBooking.pre)
  }

  if (videoLinkBooking?.post) {
    prepostData['post-court hearing briefing'] = createLocationAndTimeString(videoLinkBooking.post)
  }

  const additionalDetails = {
    ...(videoLinkBooking && { courtLocation: videoLinkBooking.main.court }),
    comments: appointment.comment || 'Not entered',
    addedBy: formatName(staffDetails.firstName, staffDetails.lastName),
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
      repeats: repeatTypes.find(repeat => repeat.value === recurring.repeatPeriod).text,
      lastAppointment: getDate(lastAppointmentDate.endOfPeriod, 'D MMMM YYYY'),
    }),
  }

  req.flash('appointmentDetails', {
    id,
    isRecurring: !!recurring,
    additionalDetails,
    basicDetails,
    prepostData,
    recurringDetails,
    timeDetails,
  })

  return res.render('appointmentDetails', {
    additionalDetails,
    basicDetails,
    prepostData,
    prisoner: {
      name: prisonerDetails && formatName(prisonerDetails.firstName, prisonerDetails.lastName),
      number: prisonerDetails?.offenderNo,
    },
    recurringDetails,
    timeDetails,
  })
}
