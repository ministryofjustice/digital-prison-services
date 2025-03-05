import moment from 'moment'
import { endRecurringEndingDate, repeatTypes } from '../shared/appointmentConstants'
import { formatName, getDate, getTime, getWith404AsNull } from '../utils'
import { app } from '../config'
import { prisonApiFactory } from '../api/prisonApi'
import VideoLinkBookingService from './videoLinkBookingService'
import { locationsInsidePrisonApiFactory, NonResidentialUsageType } from '../api/locationsInsidePrisonApi'
import { nomisMappingClientFactory } from '../api/nomisMappingClient'
import { getClientCredentialsTokens as GetClientCredentialsToken } from '../api/systemOauthClient'
import { mapLocationApiResponse } from './appointmentsService'

export default ({
  prisonApi,
  videoLinkBookingService,
  locationsInsidePrisonApi,
  nomisMapping,
  getClientCredentialsTokens,
}: {
  prisonApi: ReturnType<typeof prisonApiFactory>
  videoLinkBookingService: ReturnType<typeof VideoLinkBookingService>
  locationsInsidePrisonApi: ReturnType<typeof locationsInsidePrisonApiFactory>
  nomisMapping: ReturnType<typeof nomisMappingClientFactory>
  getClientCredentialsTokens: typeof GetClientCredentialsToken
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

    const [locationTypesUnmapped, appointmentTypes] = await Promise.all([
      locationsInsidePrisonApi.getLocations(activeCaseLoadId, NonResidentialUsageType.APPOINTMENT),
      prisonApi.getAppointmentTypes(res.locals),
    ])

    const locationTypes = locationTypesUnmapped.map(mapLocationApiResponse)

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

    if (app.bvlsMasteredAppointmentTypes.includes(appointmentDetails.appointment.appointmentTypeCode)) {
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

    const basicDetails = {
      type: appointmentType?.description,
      location: locationType?.userDescription,
      prisonVideoLink:
        app.bvlsMasteredVlpmFeatureToggleEnabled && vlb && vlb.bookingType !== 'COURT'
          ? vlb.videoLinkUrl || 'None entered'
          : undefined,
      courtLocation: vlb?.courtDescription,
      probationTeam: vlb?.probationTeamDescription,
      probationOfficer:
        app.bvlsMasteredVlpmFeatureToggleEnabled && vlb && vlb.bookingType === 'PROBATION'
          ? vlb.additionalBookingDetails?.contactName || 'Not yet known'
          : undefined,
      emailAddress:
        app.bvlsMasteredVlpmFeatureToggleEnabled && vlb && vlb.bookingType === 'PROBATION'
          ? vlb.additionalBookingDetails?.contactEmail || 'Not yet known'
          : undefined,
      ukPhoneNumber:
        app.bvlsMasteredVlpmFeatureToggleEnabled && vlb && vlb.bookingType === 'PROBATION'
          ? vlb.additionalBookingDetails?.contactNumber || 'None entered'
          : undefined,
      meetingType: vlb?.probationMeetingTypeDescription,
      hearingType: vlb?.courtHearingTypeDescription,
    }

    const timeDetails = {
      date: getDate(appointment.startTime, 'D MMMM YYYY'),
      startTime: vlb ? getTime(fetchVlbAppointments(vlb).mainAppointment.startTime) : getTime(appointment.startTime),
      endTime: vlb
        ? getTime(fetchVlbAppointments(vlb).mainAppointment.endTime)
        : (appointment.endTime && getTime(appointment.endTime)) || 'Not entered',
    }

    const recurringDetails = !app.bvlsMasteredAppointmentTypes.includes(appointment.appointmentTypeCode) && {
      recurring: recurring ? 'Yes' : 'No',
      ...(recurring && {
        repeats: repeatTypes.find((repeat) => repeat.value === recurring.repeatPeriod).text,
        lastAppointment: getDate(lastAppointmentDate.endOfPeriod, 'D MMMM YYYY'),
      }),
    }

    const additionalDetails = {
      courtHearingLink: vlb && vlb.bookingType === 'COURT' ? vlb.videoLinkUrl || 'Not yet known' : undefined,
      comments: vlb?.comments || appointment.comment || 'Not entered',
      addedBy: await getAddedBy(),
    }

    return {
      isRecurring: !!recurring,
      additionalDetails,
      basicDetails,
      prepostData,
      recurringDetails,
      timeDetails,
      canAmendVlb: vlb
        ? videoLinkBookingService.bookingIsAmendable(fetchVlbAppointments(vlb), vlb.statusCode)
        : !app.bvlsMasteredAppointmentTypes.includes(appointment.appointmentTypeCode),
    }
  }

  return {
    getAppointmentViewModel,
  }
}
