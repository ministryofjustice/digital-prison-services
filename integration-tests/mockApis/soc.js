const { stubFor } = require('./wiremock')

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const getOffenderDetails = details =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/soc/api/offender/${details.offenderNumber}`,
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      status: details.status,
      jsonBody: details.body,
    },
  })

module.exports = {
  getOffenderDetails,
}
