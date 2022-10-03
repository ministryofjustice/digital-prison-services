import type { ClientContext, OauthApiClient } from './oauthEnabledClient'
import contextProperties from '../contextProperties'

export const incentivesApiFactory = (client: OauthApiClient) => {
  const processResponse = (context: ClientContext) => (response) => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }

  const get = (context, url) => client.get(context, url).then(processResponse(context))

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))

  const getAgencyIepLevels = (context, agencyId) => get(context, `/iep/levels/${agencyId}`)

  const getIepSummaryForBooking = (context, bookingId, withDetails) =>
    get(context, `/iep/reviews/booking/${bookingId}?with-details=${withDetails}`)

  const getIepSummaryForBookingIds = (context, bookingIds) => post(context, `/iep/reviews/bookings`, bookingIds)

  const changeIepLevel = (context, bookingId, body) => post(context, `/iep/reviews/booking/${bookingId}`, body)

  return {
    getAgencyIepLevels,
    getIepSummaryForBooking,
    getIepSummaryForBookingIds,
    changeIepLevel,
  }
}

export default { incentivesApiFactory }
