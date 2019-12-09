const appointmentsServiceFactory = elite2Api => {
  const getAppointmentOptions = async (context, agency) => {
    const [locationTypes, appointmentTypes] = await Promise.all([
      elite2Api.getLocationsForAppointments(context, agency),
      elite2Api.getAppointmentTypes(context),
    ])

    return {
      locationTypes:
        locationTypes &&
        locationTypes.map(location => ({
          value: location.locationId,
          text: location.userDescription || location.description,
        })),
      appointmentTypes:
        appointmentTypes &&
        appointmentTypes.map(appointment => ({
          value: appointment.code,
          text: appointment.description,
        })),
    }
  }

  const addAppointments = async (context, appointments) => {
    await elite2Api.addAppointments(context, appointments)
  }

  return {
    getAppointmentOptions,
    addAppointments,
  }
}

module.exports = appointmentsServiceFactory
