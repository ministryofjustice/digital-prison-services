const BulkAppointmentsServiceFactory = elite2Api => {
  const getBulkAppointmentsViewModel = async (context, agency) => {
    const [locationTypes, appointmentTypes] = await Promise.all([
      elite2Api.getLocationsForAppointments(context, agency),
      elite2Api.getAppointmentTypes(context),
    ])

    return {
      locationTypes:
        locationTypes &&
        locationTypes.map(location => ({
          id: location.locationId,
          description: location.userDescription || location.description,
        })),
      appointmentTypes:
        appointmentTypes &&
        appointmentTypes.map(appointment => ({
          id: appointment.code,
          description: appointment.description,
        })),
    }
  }

  const addBulkAppointments = async (context, appointments) => {
    await elite2Api.addBulkAppointments(context, appointments)
  }

  return {
    getBulkAppointmentsViewModel,
    addBulkAppointments,
  }
}

module.exports = BulkAppointmentsServiceFactory
