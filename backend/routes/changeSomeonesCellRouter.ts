import express from 'express'
import cellMoveHomepage from '../controllers/cellMove/cellMoveHomepage'
import recentCellMoves from '../controllers/cellMove/recentCellMoves'
import cellMoveHistory from '../controllers/cellMove/cellMoveHistory'
import cellMovePrisonerSearch from '../controllers/cellMove/cellMovePrisonerSearch'
import cellMoveViewResidentialLocation from '../controllers/cellMove/cellMoveViewResidentialLocation'
import cellMoveTemporaryMove from '../controllers/cellMove/cellMoveTemporaryMove'

const router = express.Router({ mergeParams: true })

const controller = ({ caseNotesApi, prisonApi, whereaboutsApi }) => {
  router.get('/', cellMoveHomepage)
  router.get('/prisoner-search', cellMovePrisonerSearch({ prisonApi }))
  router.get('/view-residential-location', cellMoveViewResidentialLocation({ prisonApi, whereaboutsApi }))
  router.get('/temporary-move', cellMoveTemporaryMove({ prisonApi }))
  router.get('/recent-cell-moves', recentCellMoves({ prisonApi }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; caseNotesApi: ... Remove this comment to see the full error message
  router.get('/recent-cell-moves/history', cellMoveHistory({ prisonApi, caseNotesApi, whereaboutsApi }))

  return router
}

export default (dependencies) => controller(dependencies)
