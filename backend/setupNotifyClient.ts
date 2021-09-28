import { NotifyClient } from 'notifications-node-client'
import config from './config'

// @ts-expect-error ts-migrate(2339) FIXME: Property 'notifyClient' does not exist on type '{ ... Remove this comment to see the full error message
const notifyClient = config.notifyClient.enabled ? new NotifyClient(config.notifications.notifyKey) : { sendEmail() {} }

export default {
  notifyClient,
}
