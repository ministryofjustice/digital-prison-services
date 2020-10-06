const contextProperties = require('../contextProperties')
const { mapToQueryString } = require('../utils')

const offenderSearchApiFactory = client => {
  const processResponse = context => response => {
    contextProperties.setPaginationFromPageRequest(context, response.body)
    return response.body.content
  }

  const changeFieldNames = () => data =>
    data.map(
      ({
        uiId,
        prisonerNumber,
        bookingId,
        firstName,
        lastName,
        dateOfBirth,
        prisonId,
        locationDescription,
        status,
      }) => ({
        uiId,
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

  return {
    globalSearch,
  }
}

module.exports = { offenderSearchApiFactory }
