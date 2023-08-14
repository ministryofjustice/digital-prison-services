import { OauthApiClient } from './oauthEnabledClient'
import contextProperties from '../contextProperties'
import { mapToQueryString } from '../utils'

export const adjudicationsApiFactory = (client: OauthApiClient) => {
  const processResponse = (context) => (response) => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }

  const get = (context, url, resultsLimit?, retryOverride?) =>
    client.get(context, url, { resultsLimit, retryOverride }).then(processResponse(context))

  const getAdjudications = async (context, offenderNumber, params, pageOffset, pageLimit) => {
    contextProperties.setCustomRequestHeaders(context, {
      'page-offset': pageOffset || 0,
      'page-limit': pageLimit || 10,
    })

    const response = await get(
      context,
      `/adjudications/${offenderNumber}/adjudications${params && `?${mapToQueryString(params)}`}`
    )

    return {
      ...response,
      pagination: {
        pageOffset: context.responseHeaders['page-offset'],
        pageLimit: context.responseHeaders['page-limit'],
        totalRecords: context.responseHeaders['total-records'],
      },
    }
  }

  const getAdjudicationDetails = (context, offenderNumber, adjudicationNumber) =>
    get(context, `/adjudications/${offenderNumber}/charge/${adjudicationNumber}`)

  const getAdjudicationsForBooking = (context, bookingId) => get(context, `/adjudications/${bookingId}/adjudications`)

  return {
    getAdjudications,
    getAdjudicationDetails,
    getAdjudicationsForBooking,
  }
}

export default { adjudicationsApiFactory }
