import express from 'express'
import { caseNoteFactory } from '../controllers/caseNote'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi }) => {
  const { index, post, areYouSure, confirm } = caseNoteFactory({ prisonApi, caseNotesApi })

  router.get('/', index)
  router.post('/', post)
  router.get('/confirm', areYouSure)
  router.post('/confirm', confirm)

  return router
}

export default (dependencies) => controller(dependencies)
