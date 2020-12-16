const express = require('express')

const searchForCellController = require('../controllers/cellMove/searchForCell')
const selectCellController = require('../controllers/cellMove/selectCell')
const nonAssociationsController = require('../controllers/cellMove/viewNonAssociations')
const offenderDetailsController = require('../controllers/cellMove/viewOffenderDetails')
const cellSharingRiskAssessmentController = require('../controllers/cellMove/viewCellSharingAssessmentDetails')
const moveValidationController = require('../controllers/cellMove/moveValidation')
const confirmCellMoveController = require('../controllers/cellMove/confirmCellMove')
const cellMoveConfirmationController = require('../controllers/cellMove/cellMoveConfirmation')
const cswapConfirmationController = require('../controllers/cellMove/cswapConfirmation')
const cellNotAvailable = require('../controllers/cellMove/cellNotAvailable')

const router = express.Router({ mergeParams: true })

const controller = ({ oauthApi, prisonApi, whereaboutsApi, caseNotesApi, logError }) => {
  const { index: moveValidationIndex, post: moveValidationPost } = moveValidationController({ prisonApi, logError })

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
  router.get('/move-validation', moveValidationIndex)
  router.post('/move-validation', moveValidationPost)
  router.get('/confirmation', cellMoveConfirmationController({ prisonApi, logError }))
  router.get('/cswap-confirmation', cswapConfirmationController({ prisonApi, logError }))
  router.get('/cell-not-available', cellNotAvailable({ prisonApi, logError }))
  return router
}

module.exports = dependencies => controller(dependencies)
