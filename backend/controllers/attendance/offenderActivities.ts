import { switchDateFormat } from '../../utils'

export const offenderActivitesFactory = (prisonApi, whereaboutsApi) => {
  const getPrisonersUnaccountedFor = async (context, agencyId, dateString, timeSlot) => {
    const date = switchDateFormat(dateString)
    const params = {
      agencyId,
      date,
      period: timeSlot,
    }

    const { scheduled: prisonersUnaccountedFor } = await whereaboutsApi.prisonersUnaccountedFor(context, params)
    const offenderNumbers = prisonersUnaccountedFor.map((prisoner) => prisoner.offenderNo)

    const searchCriteria = { agencyId, date, timeSlot, offenderNumbers }

    const [visits, appointments] = await Promise.all([
      prisonApi.getVisits(context, searchCriteria),
      prisonApi.getAppointments(context, searchCriteria),
    ])

    return prisonersUnaccountedFor.map((prisoner) => ({
      ...prisoner,
      eventsElsewhere: [...visits, ...appointments].filter((event) => prisoner.offenderNo === event.offenderNo),
    }))
  }

  return { getPrisonersUnaccountedFor }
}

export default { offenderActivitesFactory }
