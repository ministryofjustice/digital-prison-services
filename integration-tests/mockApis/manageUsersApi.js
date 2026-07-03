const { stubFor } = require('./wiremock')

module.exports = {
  stubGetStaffDetails: (username, response) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/users/users/${username}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || {},
      },
    }),
}
