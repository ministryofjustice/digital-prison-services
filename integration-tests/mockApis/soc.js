const { stubFor } = require('./wiremock')

module.exports = {
  stubGetOffenderDetails: (details) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/soc/nominal/nomsId/${details.offenderNumber}`,
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        status: details.status,
        jsonBody: details.body,
      },
    }),
}
