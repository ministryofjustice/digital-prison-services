const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/api/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: 'ping',
      },
    })
  },
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
