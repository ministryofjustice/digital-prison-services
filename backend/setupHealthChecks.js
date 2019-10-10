const express = require('express')
const config = require('./config')
const healthFactory = require('./services/healthCheck')

const router = express.Router()

const health = healthFactory(
  config.apis.oauth2.url,
  config.apis.elite2.url,
  config.apis.whereabouts.url,
  config.apis.community.url
)

module.exports = () => {
  router.get('/health', (req, res, next) => {
    health((err, result) => {
      if (err) {
        return next(err)
      }
      if (!(result.status === 'UP')) {
        res.status(503)
      }
      res.json(result)
      return result
    })
  })

  router.get('/ping', (req, res) => res.send('pong'))

  return router
}
