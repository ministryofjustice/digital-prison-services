const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/complexity/ping',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      },
    }),
  stubGetComplexOffenders: (offenders) =>
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
