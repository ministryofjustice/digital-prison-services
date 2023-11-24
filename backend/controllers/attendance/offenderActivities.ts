import { switchDateFormat } from '../../utils'

export const offenderActivitiesFactory = (getClientCredentialsTokens, prisonApi, whereaboutsApi) => {
  const getPrisonersUnaccountedFor = async (context, agencyId, dateString, timeSlot) => {
    const date = switchDateFormat(dateString)
    const params = {
      agencyId,
      date,
      period: timeSlot,
    }

    const { scheduled: prisonersUnaccountedFor } = await whereaboutsApi.prisonersUnaccountedFor(context, params)
    const offenderNumbers = prisonersUnaccountedFor.map((prisoner) => prisoner.offenderNo)

    const systemContext = await getClientCredentialsTokens()
    const searchCriteria = { agencyId, date, timeSlot, offenderNumbers }

    const [visits, appointments] = await Promise.all([
      prisonApi.getVisits(systemContext, searchCriteria),
      prisonApi.getAppointments(systemContext, searchCriteria),
    ])

    return prisonersUnaccountedFor.map((prisoner) => ({
      ...prisoner,
      eventsElsewhere: [...visits, ...appointments].filter((event) => prisoner.offenderNo === event.offenderNo),
    }))
  }

  return { getPrisonersUnaccountedFor }
}

export default { offenderActivitiesFactory }
