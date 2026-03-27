import express from 'express'
import globalSearchRedirect from '../controllers/search/globalSearchRedirect'

const router = express.Router()
router.get('/', globalSearchRedirect({ path: 'global-search' }))
router.get('/results', globalSearchRedirect({ path: 'global-search/results' }))

export default router
