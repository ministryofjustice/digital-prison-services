const moment = require('moment')
const { repeatTypes, endRecurringEndingDate } = require('../shared/appointmentConstants')
const { DATE_TIME_FORMAT_SPEC, Time } = require('../../src/dateHelpers')
const { properCaseName } = require('../utils')

const isVideoLinkBooking = appointmentType => appointmentType === 'VLB'

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
      howOften: repeatTypes.find(repeat => repeat.value === repeats).text,
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
    ;['appointmentType', 'recurring'].forEach(e => delete appointmentInfo[e])
  }

  return appointmentInfo
}

const mapLocationType = location => ({
  value: location.locationId,
  text: location.userDescription || location.description,
})

const mapAppointmentType = appointment => ({
  value: appointment.code,
  text: appointment.description,
})

const appointmentsServiceFactory = elite2Api => {
  const getLocations = async (context, agency, filterByLocationType) =>
    filterByLocationType
      ? (await elite2Api.getLocationsForAppointments(context, agency))
          .filter(loc => loc.locationType === filterByLocationType)
          .map(mapLocationType)
      : (await elite2Api.getLocationsForAppointments(context, agency)).map(mapLocationType)

  const getAppointmentOptions = async (context, agency) => {
    const [locationTypes, appointmentTypes] = await Promise.all([
      elite2Api.getLocationsForAppointments(context, agency),
      elite2Api.getAppointmentTypes(context),
    ])

    return {
      locationTypes: locationTypes && locationTypes.map(mapLocationType),
      appointmentTypes: appointmentTypes && appointmentTypes.map(mapAppointmentType),
    }
  }
  const addAppointments = async (context, appointments) => {
    await elite2Api.addAppointments(context, appointments)
  }

  const getLocationAndAppointmentDescription = async (context, { activeCaseLoadId, locationId, appointmentType }) => {
    const { appointmentTypes, locationTypes } = await getAppointmentOptions(context, activeCaseLoadId)
    const { text: locationDescription } = locationTypes.find(loc => loc.value === Number(locationId))
    const { text: appointmentTypeDescription } = appointmentTypes.find(app => app.value === appointmentType)

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
