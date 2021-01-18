const express = require('express')

const deleteCaseNoteController = require('../controllers/deleteCaseNote')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi, oauthApi, logError }) => {
  const { index, post } = deleteCaseNoteController({ prisonApi, caseNotesApi, oauthApi, logError })

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
