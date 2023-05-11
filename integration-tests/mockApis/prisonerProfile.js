const { stubFor } = require('./wiremock')

const stubPrisonerProfile = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisonerprofile/prisoner/.+?',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<html><body><h1>New Prisoner Profile!</h1><h3>Overview Page</h3></body></html>',
    },
  })

module.exports = {
  stubPrisonerProfile,
}
