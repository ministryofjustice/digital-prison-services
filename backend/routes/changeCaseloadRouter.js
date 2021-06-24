const express = require('express')
const { changeCaseloadFactory } = require('../controllers/changeCaseload')

const router = express.Router()

const controller = ({ prisonApi, logError }) => {
  const { index, post } = changeCaseloadFactory(prisonApi, logError)

  router.get('/', index)
  router.post('/', post)
  return router
}

module.exports = (dependencies) => controller(dependencies)
