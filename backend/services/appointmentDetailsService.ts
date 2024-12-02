import moment from 'moment'
import { endRecurringEndingDate, repeatTypes } from '../shared/appointmentConstants'
import { formatName, getDate, getTime, getWith404AsNull } from '../utils'
import config from '../config'

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

    let addedBy
    let courtLocation

    const createLocationAndTimeString = (appt) =>
      `${locationTypes.find((loc) => Number(loc.locationId) === Number(appt.locationId)).userDescription} - ${getTime(
        appt.startTime
      )} to ${getTime(appt.endTime)}`

    let vlb
    if (config.apis.bookAVideoLinkApi.enabled && appointmentDetails.appointment.appointmentTypeCode === 'VLB') {
      const systemContext = await getClientCredentialsTokens(res.locals.user.username)
      vlb = await videoLinkBookingService.getVideoLinkBookingFromAppointmentId(systemContext, appointment.id)
    }

    if (vlb) {
      const { preAppointment, postAppointment } = fetchVlbAppointments(vlb)

      if (preAppointment) {
        const systemContext = await getClientCredentialsTokens(res.locals.user.username)
        const locationId = await locationsInsidePrisonApi
          .getLocationByKey(systemContext, preAppointment.prisonLocKey)
          .then((l) => nomisMapping.getNomisLocationMappingByDpsLocationId(l.id))
          .then((mapping) => mapping.nomisLocationId)

        prepostData['pre-court hearing briefing'] = createLocationAndTimeString({
          locationId,
          startTime: preAppointment.startTime,
          endTime: preAppointment.endTime,
        })
      }

      if (postAppointment) {
        const systemContext = await getClientCredentialsTokens(res.locals.user.username)
        const locationId = await locationsInsidePrisonApi
          .getLocationByKey(systemContext, postAppointment.prisonLocKey)
          .then((l) => nomisMapping.getNomisLocationMappingByDpsLocationId(l.id))
          .then((mapping) => mapping.nomisLocationId)

        prepostData['post-court hearing briefing'] = createLocationAndTimeString({
          locationId,
          startTime: postAppointment.startTime,
          endTime: postAppointment.endTime,
        })
      }

      addedBy = await (!vlb.createdByPrison ? 'Court' : getAddedByUser(res, vlb.createdBy))
      courtLocation = vlb.courtDescription
    } else {
      if (videoLinkBooking?.pre) {
        prepostData['pre-court hearing briefing'] = createLocationAndTimeString(videoLinkBooking.pre)
      }

      if (videoLinkBooking?.post) {
        prepostData['post-court hearing briefing'] = createLocationAndTimeString(videoLinkBooking.post)
      }

      addedBy = await (videoLinkBooking?.main?.madeByTheCourt ? 'Court' : getAddedByUser(res, appointment.createUserId))
      courtLocation = videoLinkBooking?.main?.court
    }

    const additionalDetails = {
      courtLocation,
      probationTeam: vlb?.probationTeamDescription,
      meetingType: vlb?.probationMeetingTypeDescription,
      hearingType: vlb?.courtHearingTypeDescription,
      courtHearingLink: vlb && vlb.bookingType === 'COURT' ? vlb.videoLinkUrl || 'Not entered' : undefined,
      comments: appointment.comment || 'Not entered',
      addedBy,
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
      canDeleteVlb: vlb ? videoLinkBookingService.bookingIsAmendable(appointment.startTime, vlb.statusCode) : true,
    }
  }

  return {
    getAppointmentViewModel,
  }
}
