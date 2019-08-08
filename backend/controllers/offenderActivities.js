const { switchDateFormat } = require('../utils')

const offenderActivitesFactory = (elite2api, whereaboutsApi) => {
  const getMissingPrisoners = async (context, agencyId, dateString, timeSlot) => {
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

    const missingPrisoners = offenderActivities.filter(
      offenderActivity => !prisonAttendance.find(attendance => offenderActivity.bookingId === attendance.bookingId)
    )

    const offenderNumbers = [...new Set(missingPrisoners.map(prisoner => prisoner.offenderNo))]

    const searchCriteria = { agencyId, date, timeSlot, offenderNumbers }

    const [visits, appointments] = await Promise.all([
      elite2api.getVisits(context, searchCriteria),
      elite2api.getAppointments(context, searchCriteria),
    ])

    const prisonersWithOtherEvents = missingPrisoners.map(prisoner => ({
      ...prisoner,
      eventsElsewhere: [...visits, ...appointments].filter(event => prisoner.offenderNo === event.offenderNo),
    }))

    return prisonersWithOtherEvents
  }

  return { getMissingPrisoners }
}

module.exports = { offenderActivitesFactory }
