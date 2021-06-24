const express = require('express')

const amendCaseNoteController = require('../controllers/amendmentCaseNote')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi, logError }) => {
  const { index, post } = amendCaseNoteController({ prisonApi, caseNotesApi, logError })

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
