const { stubFor } = require('./wiremock')

module.exports = {
  stubVerifyToken: active => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/token/verify',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          active,
        },
      },
    })
  },
}
