import express from 'express'
import { caseNoteFactory } from '../controllers/caseNote'
import prisonerProfileRedirect from '../controllers/prisonerProfile/prisonerProfileRedirect'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, caseNotesApi, oauthApi, systemOauthClient, offenderSearchApi }) => {
  const { index, post, areYouSure, confirm, recordIncentiveLevelInterruption } = caseNoteFactory({
    prisonApi,
    caseNotesApi,
    oauthApi,
    systemOauthClient,
    offenderSearchApi,
  })

  router.get('/', prisonerProfileRedirect({ path: '/add-case-note', handler: index }))
  router.post('/', post)
  router.get('/confirm', areYouSure)
  router.post('/confirm', confirm)
  router.get('/record-incentive-level', recordIncentiveLevelInterruption)

  return router
}

export default (dependencies) => controller(dependencies)
