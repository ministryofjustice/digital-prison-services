import contextProperties from '../contextProperties'
import { mapToQueryString } from '../utils'

export type Alert = {
  alertCode: string
}

export type PrisonerSearchResult = {
  firstName: string
  lastName: string
  bookingId: number
  prisonerNumber: string
  cellLocation: string
  status: string
  alerts: Array<Alert>
}

export const offenderSearchApiFactory = (client) => {
  const processResponse = (context) => (response) => {
    contextProperties.setPaginationFromPageRequest(context, response.body)
    return response.body.content
  }

  const changeFieldNames = () => (data) =>
    data.map(
      ({ prisonerNumber, bookingId, firstName, lastName, dateOfBirth, prisonId, locationDescription, status }) => ({
        offenderNo: prisonerNumber,
        firstName,
        lastName,
        dateOfBirth,
        latestBookingId: Number(bookingId),
        latestLocationId: prisonId,
        latestLocation: locationDescription,
        currentlyInPrison: status && status.startsWith('ACTIVE') ? 'Y' : 'N',
        currentWorkingFirstName: firstName,
        currentWorkingLastName: lastName,
      })
    )

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))

  const globalSearch = (context, params, pageSizeOverride) => {
    const { page, size } = contextProperties.getPaginationForPageRequest(context)
    const pageSize = pageSizeOverride || size
    return post(context, `/global-search?${mapToQueryString({ page, size: pageSize })}`, params).then(
      changeFieldNames()
    )
  }

  const getPrisonersDetails = async (context, prisonerNumbers: Array<string>): Promise<Array<PrisonerSearchResult>> => {
    const res = await client.post(context, '/prisoner-search/prisoner-numbers', { prisonerNumbers })
    return res.body
  }

  return {
    globalSearch,
    getPrisonersDetails,
  }
}

export default { offenderSearchApiFactory }
