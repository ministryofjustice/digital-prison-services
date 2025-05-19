import contextProperties from '../contextProperties'
import { AlertDetails } from './prisonApi'

const processResponse = (context) => (response) => {
  contextProperties.setResponsePagination(context, response.headers)
  return response.body
}

// replacement for prison-api endpoints for Prisoner Alerts
export const prisonerAlertsApiFactory = (client) => {
  const get = (context, url, resultsLimit?, retryOverride?) =>
    client.get(context, url, { resultsLimit, retryOverride }).then(processResponse(context))

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))

  // replace Prison-API getAlerts /api/bookings/offenderNo/${agencyId}/alerts
  // return { content: [array of results] }, not [array of results]
  const getAlerts = (context, { offenderNumbers }) => post(context, `/search/alerts/prison-numbers`, offenderNumbers)

  // replace Prison-API getAlertsForBookingV2 /api/bookings/{bookingId}/alerts/v2, same response body
  const getAlertsForPrisonNumber = (context, { prisonNumber, alertType, from, to, isActive, page, sort, size }) => {
    return get(
      context,
      `/prisoners/${prisonNumber}/alerts?${
        alertType ? `alertType=${alertType}&` : ''
      }activeFromStart=${from}&activeFromEnd=${to}&isActive=${isActive}&page=${page}&sort=${sort}&size=${size}`
    )
  }

  // replace Prison-API getAlertsForLatestBooking /api/offenders/${offenderNo}/bookings/latest/alerts
  // return { content: [array of results] }, not [array of results]
  const getAlertsForLatestBooking = (
    context,
    { prisonNumber, alertCodes, sortBy, sortDirection }
  ): Promise<AlertDetails[]> =>
    get(
      context,
      `/prisoners/${prisonNumber}/alerts?alertCode=${alertCodes.toString()}&sort=${sortBy}${
        sortDirection ? `,${sortDirection}` : ''
      }`
    )

  // replace Prison-API getAlertTypes /api/reference-domains/alertTypes
  const getAlertTypes = (context) => get(context, '/alert-types', 1000)

  return {
    getAlerts,
    getAlertsForPrisonNumber,
    getAlertsForLatestBooking,
    getAlertTypes,
  }
}

export default { prisonerAlertsApiFactory }
