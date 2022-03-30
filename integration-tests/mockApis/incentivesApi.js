const { stubFor } = require('./wiremock')

module.exports = {
  stubGetAgencyIepLevels: (response) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/incentives/iep/levels/.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubChangeIepLevel: (body) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/incentives/iep/reviews/booking/[0-9]+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: body,
      },
    }),
}
