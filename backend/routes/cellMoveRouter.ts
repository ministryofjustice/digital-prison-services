import express from 'express'
import searchForCellController from '../controllers/cellMove/searchForCell'
import selectCellController from '../controllers/cellMove/selectCell'
import selectReceptionController from '../controllers/cellMove/selectReception'
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

const controller = ({
  systemOauthClient,
  cellAllocationApi,
  oauthApi,
  prisonApi,
  whereaboutsApi,
  nonAssociationsApi,
  logError,
}) => {
  const { index: considerRisksIndex, post: considerRisksPost } = considerRisksController({
    prisonApi,
    raiseAnalyticsEvent,
    nonAssociationsApi,
  })

  const { index: confirmCellMoveIndex, post: confirmCellMovePost } = confirmCellMoveController({
    systemOauthClient,
    cellAllocationApi,
    prisonApi,
    whereaboutsApi,
  })

  router.get('/search-for-cell', searchForCellController({ oauthApi, prisonApi, whereaboutsApi, nonAssociationsApi }))
  router.get('/non-associations', nonAssociationsController({ prisonApi, nonAssociationsApi }))
  router.get('/prisoner-details', offenderDetailsController({ prisonApi, logError }))
  router.get('/cell-sharing-risk-assessment-details', cellSharingRiskAssessmentController({ prisonApi, logError }))
  router.get('/select-cell', selectCellController({ oauthApi, prisonApi, whereaboutsApi, nonAssociationsApi }))
  router.get(
    '/select-reception',
    selectReceptionController({ oauthApi, prisonApi, whereaboutsApi, nonAssociationsApi })
  )

  router.get('/confirm-cell-move', confirmCellMoveIndex)
  router.post('/confirm-cell-move', confirmCellMovePost)
  router.get('/consider-risks', considerRisksIndex)
  router.post('/consider-risks', considerRisksPost)
  router.get('/confirmation', cellMoveConfirmationController({ prisonApi, logError }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; logError: any;... Remove this comment to see the full error message
  router.get('/space-created', spaceCreatedController({ prisonApi, logError }))
  router.get('/cell-not-available', cellNotAvailable({ prisonApi, logError }))
  return router
}

export default (dependencies) => controller(dependencies)
