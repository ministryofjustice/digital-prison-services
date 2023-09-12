import contextProperties from '../contextProperties'
import { OauthApiClient } from './oauthEnabledClient'

export const cellAllocationApiFactory = (client: OauthApiClient) => {
  const processResponse = (context) => (response) => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }
  const put = (context, url, data) => client.put(context, url, data).then(processResponse(context))

  const moveToCellSwap = (context, { bookingId }) => put(context, `/api/bookings/${bookingId}/move-to-cell-swap`, {})
  return {
    moveToCellSwap,
  }
}

export default { cellAllocationApiFactory }
