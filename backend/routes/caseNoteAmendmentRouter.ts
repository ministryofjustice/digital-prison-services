// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')

const amendCaseNoteController = require('../controllers/amendmentCaseNote')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ prisonApi, caseNotesApi, logError }) => {
  const { index, post } = amendCaseNoteController({ prisonApi, caseNotesApi, logError })

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
