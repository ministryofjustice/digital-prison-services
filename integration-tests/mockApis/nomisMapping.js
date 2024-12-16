const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/nomis-mapping/health/ping',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      },
    }),

  stubNomisLocationMapping: ({ nomisLocationId, dpsLocationId }) =>
    Promise.all([
      stubFor({
        request: {
          method: 'GET',
          urlPattern: `/nomis-mapping/api/locations/nomis/${nomisLocationId}`,
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: { dpsLocationId }
        },
      }),
      stubFor({
        request: {
          method: 'GET',
          urlPattern: `/nomis-mapping/api/locations/dps/${dpsLocationId}`,
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: { nomisLocationId }
        },
      }),
    ])
}
