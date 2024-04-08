import express from 'express'
import cellMovesHasMovedPage from '../controllers/cellMove/cellMovesHasMovedPage'

const router = express.Router({ mergeParams: true })

const controller = () => {
  router.get('/', cellMovesHasMovedPage)

  return router
}

export default controller
