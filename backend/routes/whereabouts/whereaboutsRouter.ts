import { Router } from 'express'

import homePage from '../../controllers/whereabouts/homePage'
import scheduledMoves from '../../controllers/whereabouts/scheduledMoves'
import useApiClientCreds from '../../middleware/useApiClientCreds'

export default ({ oauthApi, prisonApi, offenderSearchApi, systemOauthClient }): Router => {
  const router = Router()

  const scheduledMovesController = scheduledMoves({ prisonApi, offenderSearchApi })

  router.get('/', homePage({ oauthApi, prisonApi }).index)
  router.get('/scheduled-moves', useApiClientCreds({ systemOauthClient }), scheduledMovesController.index)

  return router
}
