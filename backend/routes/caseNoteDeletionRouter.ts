// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'deleteCase... Remove this comment to see the full error message
const deleteCaseNoteController = require('../controllers/deleteCaseNote')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ prisonApi, caseNotesApi, oauthApi, logError }) => {
  const { index, post } = deleteCaseNoteController({ prisonApi, caseNotesApi, oauthApi, logError })

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
