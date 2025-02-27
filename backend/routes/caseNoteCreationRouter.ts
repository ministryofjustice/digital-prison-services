import express from 'express'
import { caseNoteFactory } from '../controllers/caseNote'
import prisonerProfileRedirect from '../controllers/prisonerProfile/prisonerProfileRedirect'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, oauthApi, systemOauthClient, restrictedPatientApi }) => {
  const { recordIncentiveLevelInterruption } = caseNoteFactory({
    prisonApi,
    oauthApi,
    systemOauthClient,
    restrictedPatientApi,
  })

  router.get('/', prisonerProfileRedirect({ path: '/add-case-note' }))

  // This should be moved to the new profile and removed.
  router.get('/record-incentive-level', recordIncentiveLevelInterruption)

  return router
}

export default (dependencies) => controller(dependencies)
