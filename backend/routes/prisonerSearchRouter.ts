import express from 'express'
import { prisonerSearchGetRedirect, prisonerSearchPostRedirect } from '../controllers/search/prisonerSearchRedirect'

const router = express.Router()
router.get('/', prisonerSearchGetRedirect)
router.post('/', prisonerSearchPostRedirect)

export default router
