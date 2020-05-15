const { stubFor } = require('./wiremock')

module.exports = {
  stubUser: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    })
  },
}
