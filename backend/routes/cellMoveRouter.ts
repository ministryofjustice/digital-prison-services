// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')

const searchForCellController = require('../controllers/cellMove/searchForCell')
const selectCellController = require('../controllers/cellMove/selectCell')
const nonAssociationsController = require('../controllers/cellMove/viewNonAssociations')
const offenderDetailsController = require('../controllers/cellMove/viewOffenderDetails')
const cellSharingRiskAssessmentController = require('../controllers/cellMove/viewCellSharingAssessmentDetails')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'considerRi... Remove this comment to see the full error message
const considerRisksController = require('../controllers/cellMove/considerRisks')
const confirmCellMoveController = require('../controllers/cellMove/confirmCellMove')
const cellMoveConfirmationController = require('../controllers/cellMove/cellMoveConfirmation')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'spaceCreat... Remove this comment to see the full error message
const spaceCreatedController = require('../controllers/cellMove/spaceCreated')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cellNotAva... Remove this comment to see the full error message
const cellNotAvailable = require('../controllers/cellMove/cellNotAvailable')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'raiseAnaly... Remove this comment to see the full error message
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ oauthApi, prisonApi, whereaboutsApi, caseNotesApi, logError }) => {
  const { index: considerRisksIndex, post: considerRisksPost } = considerRisksController({
    prisonApi,
    raiseAnalyticsEvent,
  })

  const { index: confirmCellMoveIndex, post: confirmCellMovePost } = confirmCellMoveController({
    prisonApi,
    whereaboutsApi,
    caseNotesApi,
    logError,
  })

  router.get('/search-for-cell', searchForCellController({ oauthApi, prisonApi, whereaboutsApi, logError }))
  router.get('/non-associations', nonAssociationsController({ prisonApi, logError }))
  router.get('/offender-details', offenderDetailsController({ prisonApi, logError }))
  router.get('/cell-sharing-risk-assessment-details', cellSharingRiskAssessmentController({ prisonApi, logError }))
  router.get('/select-cell', selectCellController({ oauthApi, prisonApi, whereaboutsApi, logError }))
  router.get('/confirm-cell-move', confirmCellMoveIndex)
  router.post('/confirm-cell-move', confirmCellMovePost)
  router.get('/consider-risks', considerRisksIndex)
  router.post('/consider-risks', considerRisksPost)
  router.get('/confirmation', cellMoveConfirmationController({ prisonApi, logError }))
  router.get('/space-created', spaceCreatedController({ prisonApi, logError }))
  router.get('/cell-not-available', cellNotAvailable({ prisonApi, logError }))
  return router
}

module.exports = (dependencies) => controller(dependencies)
