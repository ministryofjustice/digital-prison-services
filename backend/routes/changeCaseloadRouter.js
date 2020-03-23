const express = require('express')
const { changeCaseloadFactory } = require('../controllers/changeCaseload')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  const { index, post } = changeCaseloadFactory(elite2Api, logError)

  router.get('/', index)
  router.post('/', post)
  return router
}

module.exports = dependencies => controller(dependencies)
