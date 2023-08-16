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
    const paramsWithPageAndSize = {
      ...params,
      page: pageOffset / pageLimit,
      size: pageLimit,
    }

    const response = await get(
      context,
      `/adjudications/${offenderNumber}/adjudications${params && `?${mapToQueryString(paramsWithPageAndSize)}`}`
    )

    return {
      ...response,
      pagination: {
        pageOffset: response.results.pageable.offset,
        pageLimit: response.results.pageable.pageSize,
        totalRecords: response.results.totalElements,
      },
    }
  }

  const getAdjudicationDetails = (context, offenderNumber, adjudicationNumber) =>
    get(context, `/adjudications/${offenderNumber}/charge/${adjudicationNumber}`)

  const getAdjudicationsForBooking = (context, bookingId) => get(context, `/adjudications/by-booking-id/${bookingId}`)

  return {
    getAdjudications,
    getAdjudicationDetails,
    getAdjudicationsForBooking,
  }
}

export default { adjudicationsApiFactory }
