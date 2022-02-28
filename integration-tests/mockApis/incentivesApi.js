const { stubFor } = require('./wiremock')

module.exports = {
  stubGetAgencyIepLevels: (response) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/iep/levels/.+?',
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
