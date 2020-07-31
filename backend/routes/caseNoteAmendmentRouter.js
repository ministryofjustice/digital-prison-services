const express = require('express')

const amendCaseNoteController = require('../controllers/amendmentCaseNote')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, caseNotesApi, logError }) => {
  const { index, post } = amendCaseNoteController({ elite2Api, caseNotesApi, logError })

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
