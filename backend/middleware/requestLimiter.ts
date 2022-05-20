import RateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import redis from 'redis'

import logger from '../log'
import config from '../config'

// If more than 10 requests are made to the same url and ip address within 30 seconds
// the rate limiter will kick in and the user will receive "Too many requests, please try again later."
// and an HTTP 429 status code
export default (maxConnections?) =>
  new RateLimit({
    ...initRedisStoreIfEnabled({
      ...config.redis,
      production: config.app.production,
    }),
    windowMs: 30 * 1000, // 30 seconds
    max: () => maxConnections || 10, // max connection limit
    keyGenerator: (req) => {
      const username = req.session?.userDetails?.username
      return username + req.originalUrl
    },
    delayMs: 0, // disable delaying - full speed until the max limit is reached
  })

const initRedisStoreIfEnabled = ({ host, port, password, production }) => {
  if (!redis.enabled || !host) return null
  const client = redis.createClient({
    host,
    port,
    password,
    tls: production ? {} : false,
  })
  client.on('error', (e: Error) => logger.error(e, 'Redis client error'))
  return { store: new RedisStore({ client }) }
}
