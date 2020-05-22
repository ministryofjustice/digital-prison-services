const { stubFor } = require('./wiremock')

module.exports = {
  stubAttendanceChanges: changes => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/attendances/changes\\?fromDateTime=.+?&toDateTime=.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          changes,
        },
      },
    })
  },
}
