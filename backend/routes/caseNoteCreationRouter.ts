import express from 'express'
import { caseNoteFactory } from '../controllers/caseNote'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi, oauthApi, systemOauthClient, restrictedPatientApi }) => {
  const { index, post, areYouSure, confirm, recordIncentiveLevelInterruption } = caseNoteFactory({
    prisonApi,
    caseNotesApi,
    oauthApi,
    systemOauthClient,
    restrictedPatientApi,
  })

  router.get('/', index)
  router.post('/', post)
  router.get('/confirm', areYouSure)
  router.post('/confirm', confirm)
  router.get('/record-incentive-level', recordIncentiveLevelInterruption)

  return router
}

export default (dependencies) => controller(dependencies)
