const express = require('express')
const selectLocationController = require('../controllers/cellMove/selectLocation')
const selectCellController = require('../controllers/cellMove/selectCell')
const nonAssociationsController = require('../controllers/cellMove/viewNonAssociations')
const offenderDetailsController = require('../controllers/cellMove/viewOffenderDetails')
const cellSharingRiskAssessmentController = require('../controllers/cellMove/viewCellSharingAssessmentDetails')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, whereaboutsApi, logError }) => {
  router.get('/select-location', selectLocationController({ elite2Api, whereaboutsApi, logError }))
  router.get('/non-associations', nonAssociationsController({ elite2Api, logError }))
  router.get('/offender-details', offenderDetailsController({ elite2Api, logError }))
  router.get('/cell-sharing-risk-assessment-details', cellSharingRiskAssessmentController({ elite2Api, logError }))
  router.get('/select-cell', selectCellController({ elite2Api, whereaboutsApi, logError }))

  return router
}

module.exports = dependencies => controller(dependencies)
