const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/bookavideolink/health/ping',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      },
    }),

  matchAppointmentToVideoLinkBooking: (response) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/bookavideolink/video-link-booking/search`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response
      },
    }),

  stubGetPrisonVideoLinkSchedule: (response) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/bookavideolink/schedule/prison/(.+?)\\?date=(.+?)`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || []
      },
    }),
}
