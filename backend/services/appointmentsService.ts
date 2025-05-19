import moment from 'moment'
import { endRecurringEndingDate, repeatTypes } from '../shared/appointmentConstants'
import { DATE_TIME_FORMAT_SPEC, Time } from '../../common/dateHelpers'
import { properCaseName } from '../utils'
import { prisonApiFactory } from '../api/prisonApi'
import { locationsInsidePrisonApiFactory, NonResidentialUsageType } from '../api/locationsInsidePrisonApi'
import { nomisMappingClientFactory } from '../api/nomisMappingClient'

export const isVideoLinkBooking = (appointmentType) => appointmentType === 'VLB'

export const toAppointmentDetailsSummary = ({
  firstName,
  lastName,
  offenderNo,
  appointmentType,
  appointmentTypeDescription,
  location,
  startTime,
  endTime,
  comment,
  recurring,
  times,
  repeats,
  agencyDescription,
  court,
}) => {
  const recurringInformation = recurring === 'yes' &&
    !isVideoLinkBooking(appointmentType) && {
      howOften: repeatTypes.find((repeat) => repeat.value === repeats).text,
      numberOfAppointments: times,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ startTime: any; repeats: any; ... Remove this comment to see the full error message
      endDate: endRecurringEndingDate({ startTime, repeats, times }).endOfPeriod.format('dddd D MMMM YYYY'),
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ startTime: any; repeats: any; ... Remove this comment to see the full error message
      endDateShortFormat: endRecurringEndingDate({ startTime, repeats, times }).endOfPeriod.format('D MMMM YYYY'),
    }

  const appointmentInfo = {
    prisonerName: isVideoLinkBooking(appointmentType)
      ? `${properCaseName(firstName)} ${properCaseName(lastName)}`
      : `${properCaseName(lastName)}, ${properCaseName(firstName)} (${offenderNo})`,
    prison: agencyDescription,
    appointmentType: appointmentTypeDescription,
    location,
    date: moment(startTime, DATE_TIME_FORMAT_SPEC).format('D MMMM YYYY'),
    startTime: Time(startTime),
    endTime: endTime && Time(endTime),
    comment,
    recurring: properCaseName(recurring),
    ...recurringInformation,
    court,
  }

  if (isVideoLinkBooking(appointmentType)) {
    ;['appointmentType', 'recurring'].forEach((e) => delete appointmentInfo[e])
  }

  return appointmentInfo
}

const mapLocationType = async (location, context, nomisMapping) => {
  return {
    value: (await nomisMapping.getNomisLocationMappingByDpsLocationId(context, location.locationId)).nomisLocationId,
    text: location.userDescription || location.description,
  }
}

const mapAppointmentType = (appointment) => ({
  value: appointment.code,
  text: appointment.description,
})

export function mapLocationApiResponse(location) {
  return {
    locationId: location.id,
    locationType: location.locationType,
    description: location.pathHierarchy,
    agencyId: location.prisonId,
    parentLocationId: location.parentId,
    locationPrefix: location.key,
    userDescription: location.localName,
  }
}

export const appointmentsServiceFactory = (
  prisonApi: ReturnType<typeof prisonApiFactory>,
  locationsInsidePrisonApi: ReturnType<typeof locationsInsidePrisonApiFactory>,
  nomisMapping: ReturnType<typeof nomisMappingClientFactory>
) => {
  const getAppointmentOptions = async (locals, context, agency) => {
    const [locationTypes, appointmentTypes] = await Promise.all([
      locationsInsidePrisonApi.getLocationsByNonResidentialUsageType(
        context,
        agency,
        NonResidentialUsageType.APPOINTMENT
      ),
      prisonApi.getAppointmentTypes(locals),
    ])

    return {
      locationTypes:
        locationTypes &&
        (await Promise.all(
          locationTypes.map(mapLocationApiResponse)?.map((lt) => mapLocationType(lt, context, nomisMapping))
        )),
      appointmentTypes: appointmentTypes && appointmentTypes.map(mapAppointmentType),
    }
  }

  return {
    getAppointmentOptions,
  }
}

export default {
  appointmentsServiceFactory,
  isVideoLinkBooking,
  toAppointmentDetailsSummary,
}
