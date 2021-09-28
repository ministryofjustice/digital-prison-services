import { Router } from 'express'

import homePage from '../../controllers/whereabouts/homePage'
import scheduledMoves from '../../controllers/whereabouts/scheduledMoves'

export default ({ oauthApi, prisonApi, offenderSearchApi }): Router => {
  const router = Router()

  const scheduledMovesController = scheduledMoves({ prisonApi, offenderSearchApi })

  router.get('/', homePage({ oauthApi, prisonApi }).index)
  router.get('/scheduled-moves', scheduledMovesController.index)

  return router
}
