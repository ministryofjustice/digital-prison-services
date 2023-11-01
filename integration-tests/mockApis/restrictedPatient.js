const { stubFor } = require('./wiremock')

module.exports = {
  stubIsCaseLoadRestrictedPatient: (details) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/restricted-patient/prison-number/${details.offenderNumber}`,
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
