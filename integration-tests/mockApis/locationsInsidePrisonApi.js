const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/locations/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),

  stubGetLocationPrefix: ({ prisonId, group, response }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/locations/locations/prison/${prisonId}/group/${group}/location-prefix`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubGetAgencyGroupLocations: ({ agencyId, groupName, response }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/locations/locations/groups/${agencyId}/${groupName}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
}
