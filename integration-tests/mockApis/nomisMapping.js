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
    })
}
