import moment from 'moment'
import { endRecurringEndingDate, repeatTypes } from '../shared/appointmentConstants'
import { formatName, getDate, getTime, getWith404AsNull } from '../utils'

export default ({
  prisonApi,
  videoLinkBookingService,
  locationsInsidePrisonApi,
  nomisMapping,
  getClientCredentialsTokens,
}) => {
  const getAddedByUser = async (res, userId) => {
    const staffDetails = await getWith404AsNull(prisonApi.getStaffDetails(res.locals, userId))
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstName' does not exist on type 'unkno... Remove this comment to see the full error message
    return (staffDetails && formatName(staffDetails.firstName, staffDetails.lastName)) || userId
  }

  const fetchVlbAppointments = (videoLinkBooking) => {
    const findAppointment = (type) => videoLinkBooking.prisonAppointments.find((a) => a.appointmentType === type)

    const preAppointment = findAppointment('VLB_COURT_PRE')
    const mainAppointment = findAppointment('VLB_COURT_MAIN') || findAppointment('VLB_PROBATION')
    const postAppointment = findAppointment('VLB_COURT_POST')

    return {
      preAppointment,
      mainAppointment,
      postAppointment,
    }
  }

  const getAppointmentViewModel = async (res, appointmentDetails, activeCaseLoadId) => {
    const { appointment, recurring } = appointmentDetails

    const [locationTypes, appointmentTypes] = await Promise.all([
      prisonApi.getLocationsForAppointments(res.locals, activeCaseLoadId),
      prisonApi.getAppointmentTypes(res.locals),
    ])

    const appointmentType = appointmentTypes?.find((type) => type.code === appointment.appointmentTypeCode)

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

    let vlb
    let locationType

    if (appointmentDetails.appointment.appointmentTypeCode === 'VLB') {
      const systemContext = await getClientCredentialsTokens(res.locals.user.username)
      vlb = await videoLinkBookingService.getVideoLinkBookingFromAppointmentId(systemContext, appointment.id)
    }

    if (vlb) {
      const { preAppointment, mainAppointment, postAppointment } = fetchVlbAppointments(vlb)
      const systemContext = await getClientCredentialsTokens(res.locals.user.username)

      locationType = await locationsInsidePrisonApi
        .getLocationByKey(systemContext, mainAppointment.prisonLocKey)
        .then((l) => nomisMapping.getNomisLocationMappingByDpsLocationId(systemContext, l.id))
        .then((mapping) => mapping.nomisLocationId)
        .then((id) => locationTypes.find((loc) => Number(loc.locationId) === Number(id)))

      if (preAppointment) {
        const locationId = await locationsInsidePrisonApi
          .getLocationByKey(systemContext, preAppointment.prisonLocKey)
          .then((l) => nomisMapping.getNomisLocationMappingByDpsLocationId(systemContext, l.id))
          .then((mapping) => mapping.nomisLocationId)

        prepostData['pre-court hearing briefing'] = createLocationAndTimeString({
          locationId,
          startTime: preAppointment.startTime,
          endTime: preAppointment.endTime,
        })
      }

      if (postAppointment) {
        const locationId = await locationsInsidePrisonApi
          .getLocationByKey(systemContext, postAppointment.prisonLocKey)
          .then((l) => nomisMapping.getNomisLocationMappingByDpsLocationId(systemContext, l.id))
          .then((mapping) => mapping.nomisLocationId)

        prepostData['post-court hearing briefing'] = createLocationAndTimeString({
          locationId,
          startTime: postAppointment.startTime,
          endTime: postAppointment.endTime,
        })
      }
    } else {
      locationType = locationTypes?.find((loc) => Number(loc.locationId) === Number(appointment.locationId))
    }

    const getAddedBy = () => {
      if (vlb && !vlb.createdByPrison) return vlb.bookingType === 'COURT' ? 'Court' : 'Probation team'
      return vlb ? getAddedByUser(res, vlb.createdBy) : getAddedByUser(res, appointment.createUserId)
    }

    const additionalDetails = {
      courtLocation: vlb?.courtDescription,
      probationTeam: vlb?.probationTeamDescription,
      meetingType: vlb?.probationMeetingTypeDescription,
      hearingType: vlb?.courtHearingTypeDescription,
      courtHearingLink: vlb && vlb.bookingType === 'COURT' ? vlb.videoLinkUrl || 'Not yet known' : undefined,
      comments: vlb?.comments || appointment.comment || 'Not entered',
      addedBy: await getAddedBy(),
    }

    const basicDetails = {
      type: appointmentType?.description,
      location: locationType?.userDescription,
      date: getDate(appointment.startTime, 'D MMMM YYYY'),
    }

    const timeDetails = {
      startTime: vlb ? getTime(fetchVlbAppointments(vlb).mainAppointment.startTime) : getTime(appointment.startTime),
      endTime: vlb
        ? getTime(fetchVlbAppointments(vlb).mainAppointment.endTime)
        : (appointment.endTime && getTime(appointment.endTime)) || 'Not entered',
    }

    const recurringDetails = appointment.appointmentTypeCode !== 'VLB' && {
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
      canAmendVlb: vlb ? videoLinkBookingService.bookingIsAmendable(fetchVlbAppointments(vlb), vlb.statusCode) : true,
    }
  }

  return {
    getAppointmentViewModel,
  }
}
