const express = require('express')

const selectLocationController = require('../controllers/cellMove/selectLocation')
const selectCellController = require('../controllers/cellMove/selectCell')
const nonAssociationsController = require('../controllers/cellMove/viewNonAssociations')
const offenderDetailsController = require('../controllers/cellMove/viewOffenderDetails')
const cellSharingRiskAssessmentController = require('../controllers/cellMove/viewCellSharingAssessmentDetails')
const { moveValidationFactory } = require('../controllers/cellMove/moveValidation')
const confirmCellMoveController = require('../controllers/cellMove/confirmCellMove')
const cellMoveConfirmationController = require('../controllers/cellMove/cellMoveConfirmation')
const cswapConfirmationController = require('../controllers/cellMove/cswapConfirmation')
const cellNotAvailable = require('../controllers/cellMove/cellNotAvailable')

const router = express.Router({ mergeParams: true })

const controller = ({ oauthApi, elite2Api, whereaboutsApi, logError }) => {
  const { index: moveValidationIndex, post: moveValidationPost } = moveValidationFactory({ elite2Api, logError })

  const { index: confirmCellMoveIndex, post: confirmCellMovePost } = confirmCellMoveController({ elite2Api, logError })

  router.get('/select-location', selectLocationController({ oauthApi, elite2Api, whereaboutsApi, logError }))
  router.get('/non-associations', nonAssociationsController({ elite2Api, logError }))
  router.get('/offender-details', offenderDetailsController({ elite2Api, logError }))
  router.get('/cell-sharing-risk-assessment-details', cellSharingRiskAssessmentController({ elite2Api, logError }))
  router.get('/select-cell', selectCellController({ oauthApi, elite2Api, whereaboutsApi, logError }))
  router.get('/confirm-cell-move', confirmCellMoveIndex)
  router.post('/confirm-cell-move', confirmCellMovePost)
  router.get('/move-validation', moveValidationIndex)
  router.post('/move-validation', moveValidationPost)
  router.get('/confirmation', cellMoveConfirmationController({ elite2Api, logError }))
  router.get('/cswap-confirmation', cswapConfirmationController({ elite2Api, logError }))
  router.get('/cell-not-available', cellNotAvailable({ elite2Api, logError }))
  return router
}

module.exports = dependencies => controller(dependencies)
