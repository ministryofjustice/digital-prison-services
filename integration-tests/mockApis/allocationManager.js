const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/allocation/health/',
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
  stubGetPomForOffender: (response, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/allocation/api/allocation/.+?',
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
