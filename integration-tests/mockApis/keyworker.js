const { stubFor } = require('./wiremock')

module.exports = {
  stubKeyworkerByCaseloadAndOffenderNo: details => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/key-worker/.+?/offender/.+?',
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
