import express from 'express'
import { caseNoteFactory } from '../controllers/caseNote'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi }) => {
  const { index, post } = caseNoteFactory({ prisonApi, caseNotesApi })

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
