import express from 'express'
import amendCaseNoteController from '../controllers/amendmentCaseNote'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi, logError }) => {
  const { index, post } = amendCaseNoteController({ prisonApi, caseNotesApi, logError })

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
