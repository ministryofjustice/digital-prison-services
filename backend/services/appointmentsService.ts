// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'repeatType... Remove this comment to see the full error message
const { repeatTypes, endRecurringEndingDate } = require('../shared/appointmentConstants')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DATE_TIME_... Remove this comment to see the full error message
const { DATE_TIME_FORMAT_SPEC, Time } = require('../../common/dateHelpers')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'properCase... Remove this comment to see the full error message
const { properCaseName } = require('../utils')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isVideoLin... Remove this comment to see the full error message
const isVideoLinkBooking = (appointmentType) => appointmentType === 'VLB'

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'toAppointm... Remove this comment to see the full error message
const toAppointmentDetailsSummary = ({
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
      endDate: endRecurringEndingDate({ startTime, repeats, times }).endOfPeriod.format('dddd D MMMM YYYY'),
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

const mapLocationType = (location) => ({
  value: location.locationId,
  text: location.userDescription || location.description,
})

const mapAppointmentType = (appointment) => ({
  value: appointment.code,
  text: appointment.description,
})

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appointmen... Remove this comment to see the full error message
const appointmentsServiceFactory = (prisonApi) => {
  const getLocations = async (context, agency, filterByLocationType) =>
    filterByLocationType
      ? (await prisonApi.getLocationsForAppointments(context, agency))
          .filter((loc) => loc.locationType === filterByLocationType)
          .map(mapLocationType)
      : (await prisonApi.getLocationsForAppointments(context, agency)).map(mapLocationType)

  const getAppointmentOptions = async (context, agency) => {
    const [locationTypes, appointmentTypes] = await Promise.all([
      prisonApi.getLocationsForAppointments(context, agency),
      prisonApi.getAppointmentTypes(context),
    ])

    return {
      locationTypes: locationTypes && locationTypes.map(mapLocationType),
      appointmentTypes: appointmentTypes && appointmentTypes.map(mapAppointmentType),
    }
  }
  const addAppointments = async (context, appointments) => {
    await prisonApi.addAppointments(context, appointments)
  }

  const getLocationAndAppointmentDescription = async (context, { activeCaseLoadId, locationId, appointmentType }) => {
    const { appointmentTypes, locationTypes } = await getAppointmentOptions(context, activeCaseLoadId)
    const { text: locationDescription } = locationTypes.find((loc) => loc.value === Number(locationId))
    const { text: appointmentTypeDescription } = appointmentTypes.find((app) => app.value === appointmentType)

    return {
      locationDescription,
      appointmentTypeDescription,
    }
  }

  return {
    getLocationAndAppointmentDescription,
    getAppointmentOptions,
    addAppointments,
    getLocations,
  }
}

module.exports = {
  appointmentsServiceFactory,
  isVideoLinkBooking,
  toAppointmentDetailsSummary,
}
