const { stubFor, getMatchingRequests } = require('./wiremock')

const getOffenderDetails = details =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
      body: details,
    },
  })

module.exports = {
  getOffenderDetails,
}
