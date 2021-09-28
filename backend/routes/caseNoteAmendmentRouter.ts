import express from 'express'
import amendCaseNoteController from '../controllers/amendmentCaseNote'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi, logError }) => {
  const { index, post, areYouSure, confirm } = amendCaseNoteController({ prisonApi, caseNotesApi, logError })

  router.get('/', index)
  router.post('/', post)
  router.get('/confirm', areYouSure)
  router.post('/confirm', confirm)

  return router
}

export default (dependencies) => controller(dependencies)
