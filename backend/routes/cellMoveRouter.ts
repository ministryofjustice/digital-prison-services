import express from 'express'
import searchForCellController from '../controllers/cellMove/searchForCell'
import selectCellController from '../controllers/cellMove/selectCell'
import nonAssociationsController from '../controllers/cellMove/viewNonAssociations'
import offenderDetailsController from '../controllers/cellMove/viewOffenderDetails'
import cellSharingRiskAssessmentController from '../controllers/cellMove/viewCellSharingAssessmentDetails'
import considerRisksController from '../controllers/cellMove/considerRisks'
import confirmCellMoveController from '../controllers/cellMove/confirmCellMove'
import cellMoveConfirmationController from '../controllers/cellMove/cellMoveConfirmation'
import spaceCreatedController from '../controllers/cellMove/spaceCreated'
import cellNotAvailable from '../controllers/cellMove/cellNotAvailable'
import { raiseAnalyticsEvent } from '../raiseAnalyticsEvent'

const router = express.Router({ mergeParams: true })

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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; logError: any;... Remove this comment to see the full error message
  router.get('/confirmation', cellMoveConfirmationController({ prisonApi, logError }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; logError: any;... Remove this comment to see the full error message
  router.get('/space-created', spaceCreatedController({ prisonApi, logError }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; logError: any;... Remove this comment to see the full error message
  router.get('/cell-not-available', cellNotAvailable({ prisonApi, logError }))
  return router
}

export default (dependencies) => controller(dependencies)
