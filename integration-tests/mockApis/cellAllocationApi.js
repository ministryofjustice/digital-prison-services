const { stubFor, verifyPut } = require('./wiremock')

module.exports = {
  verifyMoveToCellSwap: ({ bookingId }) => verifyPut(`/api/bookings/${bookingId}/move-to-cell-swap`),

  stubMoveToCellSwap: () =>
    stubFor({
      request: {
        method: 'PUT',
        urlPathPattern: '/api/bookings/[0-9]+?/move-to-cell-swap',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    }),
}
