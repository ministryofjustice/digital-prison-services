const { stubFor } = require('./wiremock')

module.exports = {
  stubGetOffenderDetails: details => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/soc/api/offender/${details.offenderNumber}`,
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        status: details.status,
        jsonBody: details.body,
      },
    })
  },
}
