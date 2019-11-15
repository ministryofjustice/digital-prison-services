const express = require('express')
const { changeCaseloadFactory } = require('./changeCaseload')

const router = express.Router()

const controller = ({ oauthApi, elite2Api, logError }) => {
  const index = changeCaseloadFactory(oauthApi, elite2Api, logError)

  router.get('/', index)
  return router
}

module.exports = dependencies => controller(dependencies)
