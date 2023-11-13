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

const controller = ({ oauthApi, systemOauthClient, prisonApi, whereaboutsApi, nonAssociationsApi }) => {
  const { index: considerRisksIndex, post: considerRisksPost } = considerRisksController({
    systemOauthClient,
    prisonApi,
    raiseAnalyticsEvent,
    nonAssociationsApi,
  })

  const { index: confirmCellMoveIndex, post: confirmCellMovePost } = confirmCellMoveController({
    prisonApi,
    whereaboutsApi,
  })

  router.get('/search-for-cell', searchForCellController({ oauthApi, prisonApi, whereaboutsApi, nonAssociationsApi }))
  router.get('/non-associations', nonAssociationsController({ prisonApi, nonAssociationsApi }))
  router.get('/prisoner-details', offenderDetailsController({ prisonApi }))
  router.get('/cell-sharing-risk-assessment-details', cellSharingRiskAssessmentController({ prisonApi }))
  router.get(
    '/select-cell',
    selectCellController({ oauthApi, systemOauthClient, prisonApi, whereaboutsApi, nonAssociationsApi })
  )
  router.get(
    '/select-reception',
    selectReceptionController({ oauthApi, systemOauthClient, prisonApi, whereaboutsApi, nonAssociationsApi })
  )

  router.get('/confirm-cell-move', confirmCellMoveIndex)
  router.post('/confirm-cell-move', confirmCellMovePost)
  router.get('/consider-risks', considerRisksIndex)
  router.post('/consider-risks', considerRisksPost)
  router.get('/confirmation', cellMoveConfirmationController({ prisonApi }))
  router.get('/space-created', spaceCreatedController({ prisonApi }))
  router.get('/cell-not-available', cellNotAvailable({ prisonApi }))
  return router
}

export default (dependencies) => controller(dependencies)
