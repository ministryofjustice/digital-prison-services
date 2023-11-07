const { stubFor } = require('./wiremock')

module.exports = {
  stubGetPrisonIncentiveLevels: (response) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/incentives/incentive/prison-levels/.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubGetIepSummaryForBooking: (iepSummary, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/incentives/incentive-reviews/booking/[0-9]+?\\?.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: iepSummary || {},
      },
    }),
  stubGetIepSummaryForBookingIds: (body) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/incentives/incentive-reviews/bookings',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: body || [],
      },
    }),
  stubChangeIepLevel: (body) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/incentives/incentive-reviews/booking/[0-9]+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: body,
      },
    }),
}
