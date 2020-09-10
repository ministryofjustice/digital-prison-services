const express = require('express')
const selectLocationController = require('../controllers/cellMove/selectLocation')
const selectCellController = require('../controllers/cellMove/selectCell')
const nonAssociationsController = require('../controllers/cellMove/viewNonAssociations')
const offenderDetailsController = require('../controllers/cellMove/viewOffenderDetails')
const cellSharingRiskAssessmentController = require('../controllers/cellMove/viewCellSharingAssessmentDetails')
const { moveValidationFactory } = require('../controllers/cellMove/moveValidation')
const makeCellMoveController = require('../controllers/cellMove/makeCellMove')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, whereaboutsApi, logError }) => {
  const {
    index: moveValidationIndex,
    post: moveValidationPost,
    confirm: moveValidationConfirmation,
  } = moveValidationFactory({ elite2Api, logError })

  router.get('/select-location', selectLocationController({ elite2Api, whereaboutsApi, logError }))
  router.get('/non-associations', nonAssociationsController({ elite2Api, logError }))
  router.get('/offender-details', offenderDetailsController({ elite2Api, logError }))
  router.get('/cell-sharing-risk-assessment-details', cellSharingRiskAssessmentController({ elite2Api, logError }))
  router.get('/select-cell', selectCellController({ elite2Api, whereaboutsApi, logError }))
  router.get('/move-validation', moveValidationIndex)
  router.post('/move-validation', moveValidationPost)
  router.get('/confirmation', moveValidationConfirmation)
  router.post('/make-cell-move', makeCellMoveController({ elite2Api }))
  router.get('/cell-move-confirmation', (req, res) => {
    res.send('Cell move confirmation page')
    return res.end()
  })

  return router
}

module.exports = dependencies => controller(dependencies)
