const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: () =>
    stubFor({
      request: {
        method: 'GET',
        url: '/complexity/health',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
        body: 'Everything is fine.',
      },
    }),
  stubGetComplexOffenders: offenders =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/complexity/v1/complexity-of-need/multiple/offender-no',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offenders,
      },
    }),
}
