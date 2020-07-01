const { stubFor } = require('./wiremock')

module.exports = {
  stubGetPomForOffender: (response, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/allocation/.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || {},
      },
    })
  },
}
