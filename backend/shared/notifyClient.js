const { NotifyClient } = require('notifications-node-client')
const config = require('../config')

const notifyClient = new NotifyClient(config.notifications.notifyKey)

module.exports = {
  notifyClient,
}
