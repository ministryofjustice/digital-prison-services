import express from 'express'
import amendCaseNoteController from '../controllers/amendmentCaseNote'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi, oauthApi, systemOauthClient, restrictedPatientApi, logError }) => {
  const { index, post, areYouSure, confirm } = amendCaseNoteController({
    prisonApi,
    caseNotesApi,
    oauthApi,
    systemOauthClient,
    restrictedPatientApi,
    logError,
  })

  router.get('/', index)
  router.post('/', post)
  router.get('/confirm', areYouSure)
  router.post('/confirm', confirm)

  return router
}

export default (dependencies) => controller(dependencies)
