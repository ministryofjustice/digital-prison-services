import express from 'express'
import globalSearchRedirect from '../controllers/search/globalSearchRedirect'

const router = express.Router()

const controller = () => {
  router.get('/', globalSearchRedirect({ path: 'global-search' }))
  router.get('/results', globalSearchRedirect({ path: 'global-search/results' }))
  return router
}

export default () => controller()
