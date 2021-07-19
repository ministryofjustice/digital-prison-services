// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
const cellMoveHomepage = require('../controllers/cellMove/cellMoveHomepage')
const recentCellMoves = require('../controllers/cellMove/recentCellMoves')
const cellMoveHistory = require('../controllers/cellMove/cellMoveHistory')
const cellMovePrisonerSearch = require('../controllers/cellMove/cellMovePrisonerSearch')
const cellMoveViewResidentialLocation = require('../controllers/cellMove/cellMoveViewResidentialLocation')
const cellMoveTemporaryMove = require('../controllers/cellMove/cellMoveTemporaryMove')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ caseNotesApi, prisonApi, whereaboutsApi }) => {
  router.get('/', cellMoveHomepage)
  router.get('/prisoner-search', cellMovePrisonerSearch({ prisonApi }))
  router.get('/view-residential-location', cellMoveViewResidentialLocation({ prisonApi, whereaboutsApi }))
  router.get('/temporary-move', cellMoveTemporaryMove({ prisonApi }))
  router.get('/recent-cell-moves', recentCellMoves({ prisonApi }))
  router.get('/recent-cell-moves/history', cellMoveHistory({ prisonApi, caseNotesApi, whereaboutsApi }))

  return router
}

module.exports = (dependencies) => controller(dependencies)
