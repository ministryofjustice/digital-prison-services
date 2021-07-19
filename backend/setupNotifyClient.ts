// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'NotifyClie... Remove this comment to see the full error message
const { NotifyClient } = require('notifications-node-client')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'notifyClie... Remove this comment to see the full error message
const notifyClient = config.notifyClient.enabled ? new NotifyClient(config.notifications.notifyKey) : { sendEmail() {} }

module.exports = {
  notifyClient,
}
