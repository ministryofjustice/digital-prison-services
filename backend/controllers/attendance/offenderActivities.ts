// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'switchDate... Remove this comment to see the full error message
const { switchDateFormat } = require('../../utils')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'offenderAc... Remove this comment to see the full error message
const offenderActivitesFactory = (prisonApi, whereaboutsApi) => {
  const getPrisonersUnaccountedFor = async (context, agencyId, dateString, timeSlot) => {
    const date = switchDateFormat(dateString)
    const params = {
      agencyId,
      date,
      period: timeSlot,
    }

    const [offenderActivities, prisonAttendance] = await Promise.all([
      prisonApi.getOffenderActivities(context, params),
      whereaboutsApi.getPrisonAttendance(context, params),
    ])

    const prisonersUnaccountedFor = offenderActivities.filter(
      (offenderActivity) =>
        !prisonAttendance.attendances ||
        !prisonAttendance.attendances.find(
          (attendance) =>
            offenderActivity.bookingId === attendance.bookingId && offenderActivity.eventId === attendance.eventId
        )
    )

    const offenderNumbers = prisonersUnaccountedFor.map((prisoner) => prisoner.offenderNo)

    const searchCriteria = { agencyId, date, timeSlot, offenderNumbers }

    const [visits, appointments] = await Promise.all([
      prisonApi.getVisits(context, searchCriteria),
      prisonApi.getAppointments(context, searchCriteria),
    ])

    const prisonersWithOtherEvents = prisonersUnaccountedFor.map((prisoner) => ({
      ...prisoner,
      eventsElsewhere: [...visits, ...appointments].filter((event) => prisoner.offenderNo === event.offenderNo),
    }))

    return prisonersWithOtherEvents
  }

  return { getPrisonersUnaccountedFor }
}

module.exports = { offenderActivitesFactory }
