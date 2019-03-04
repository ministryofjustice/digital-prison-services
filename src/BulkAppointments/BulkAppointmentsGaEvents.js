export const bulkAppointmentGaEvent = {
  category: 'bulk appointments created',
  label: 'bulk appointments',
}

export const NumberOfAppointmentsEvent = ({ total, agencyId }) => ({
  ...bulkAppointmentGaEvent,
  action: `bulk appointments created for ${agencyId}`,
  value: total,
})

export const AppointmentTypeUsed = ({ total, appointmentType }) => ({
  ...bulkAppointmentGaEvent,
  action: `appointment type ${appointmentType}`,
  value: total,
})

export const RecordWhenTheStartTimesHaveBeenAmended = ({ appointmentsDefaults, appointments }) => {
  const countOfDifferences = appointments.filter(
    appointment => appointment.startTime && appointment.startTime !== appointmentsDefaults.startTime
  ).length

  if (countOfDifferences === 0) return null

  return {
    ...bulkAppointmentGaEvent,
    action: `start time has been amended`,
    value: countOfDifferences,
  }
}

export const RecordAbandonment = () => ({
  ...bulkAppointmentGaEvent,
  action: `bulk appointments abandoned`,
})
