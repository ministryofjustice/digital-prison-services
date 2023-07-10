const { stubFor } = require('./wiremock')


module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        fixedDelayMilliseconds: status === 500 ? 5000 : '',
      },
    }),

  stubOffenderNonAssociations: (response) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/offenders/[0-9A-Z].+?/non-association-details',
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
