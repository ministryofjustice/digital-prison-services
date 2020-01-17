const { switchDateFormat } = require('../../utils')

const offenderActivitesFactory = (elite2api, whereaboutsApi) => {
  const getPrisonersUnaccountedFor = async (context, agencyId, dateString, timeSlot) => {
    const date = switchDateFormat(dateString)
    const params = {
      agencyId,
      date,
      period: timeSlot,
    }

    const [offenderActivities, prisonAttendance] = await Promise.all([
      elite2api.getOffenderActivities(context, params),
      whereaboutsApi.getPrisonAttendance(context, params),
    ])

    const prisonersUnaccountedFor = offenderActivities.filter(
      offenderActivity =>
        prisonAttendance.attendances &&
        !prisonAttendance.attendances.find(
          attendance =>
            offenderActivity.bookingId === attendance.bookingId && offenderActivity.eventId === attendance.eventId
        )
    )

    const offenderNumbers = prisonersUnaccountedFor.map(prisoner => prisoner.offenderNo)

    const searchCriteria = { agencyId, date, timeSlot, offenderNumbers }

    const [visits, appointments] = await Promise.all([
      elite2api.getVisits(context, searchCriteria),
      elite2api.getAppointments(context, searchCriteria),
    ])

    const prisonersWithOtherEvents = prisonersUnaccountedFor.map(prisoner => ({
      ...prisoner,
      eventsElsewhere: [...visits, ...appointments].filter(event => prisoner.offenderNo === event.offenderNo),
    }))

    return prisonersWithOtherEvents
  }

  return { getPrisonersUnaccountedFor }
}

module.exports = { offenderActivitesFactory }
