// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'serviceUna... Remove this comment to see the full error message
const serviceUnavailableMessage = 'Sorry, the service is unavailable'
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'notEntered... Remove this comment to see the full error message
const notEnteredMessage = 'Not entered'

module.exports = {
  serviceUnavailableMessage,
  notEnteredMessage,
}
