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
  stubAttendanceChanges: (changes, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/attendances/changes\\?fromDateTime=.+?&toDateTime=.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          changes,
        },
      },
    })
  },
  stubCourtLocations: (locations, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/court/all-courts',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || {
          courtLocations: ['London', 'Sheffield', 'Leeds'],
        },
      },
    })
  },
  stubAddVideoLinkAppointment: (appointment, status = 200) => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/court/add-video-link-appointment',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointment || {},
      },
    })
  },
}
