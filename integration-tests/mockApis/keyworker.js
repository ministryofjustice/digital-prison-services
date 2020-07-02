const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/keyworker/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },
  stubKeyworkerByCaseloadAndOffenderNo: details => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/keyworker/key-worker/.+?/offender/.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {
          firstName: 'John',
          lastName: 'Smith',
        },
      },
    })
  },
}
