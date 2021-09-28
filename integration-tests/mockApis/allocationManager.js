const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/allocation/health/',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: 'ping',
      },
    }),
  stubGetPomForOffender: (response, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/allocation/api/allocation/.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || {},
      },
    }),
}
