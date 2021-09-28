import { NotifyClient } from 'notifications-node-client'
import config from '../config'

export const notifyClient = config.notifications.enabled
  ? new NotifyClient(config.notifications.notifyKey)
  : { sendEmail() {} }

export default {
  notifyClient,
}
