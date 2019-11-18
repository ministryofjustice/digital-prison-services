const express = require('express')
const { changeCaseloadFactory } = require('./changeCaseload')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  const { index } = changeCaseloadFactory(elite2Api, logError)

  router.get('/', index)
  return router
}

module.exports = dependencies => controller(dependencies)
