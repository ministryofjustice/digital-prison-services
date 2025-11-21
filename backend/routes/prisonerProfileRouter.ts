import express from 'express'
import EsweService from '../services/esweService'
import prisonerSchedule from '../controllers/prisonerProfile/prisonerSchedule'
import paginationService from '../services/paginationService'
import workInsidePrison from '../controllers/prisonerProfile/prisonerWorkInsidePrisonDetails'
import prisonerProfileRedirect from '../controllers/prisonerProfile/prisonerProfileRedirect'

const router = express.Router({ mergeParams: true })

const controller = ({
  prisonApi,
  prisonerAlertsApi,
  keyworkerApi,
  oauthApi,
  hmppsManageUsersApi,
  caseNotesApi,
  systemOauthClient,
  dataComplianceApi,
  pathfinderApi,
  logError,
  socApi,
  whereaboutsApi,
  complexityApi,
  offenderSearchApi,
  curiousApi,
  incentivesApi,
  restrictedPatientApi,
  nonAssociationsApi,
}) => {
  const esweService = EsweService.create(curiousApi, systemOauthClient, prisonApi, whereaboutsApi)

  router.get('/', prisonerProfileRedirect({ path: '/' }))

  router.get('/image', prisonerProfileRedirect({ path: '/image' }))

  router.get('/personal', prisonerProfileRedirect({ path: '/personal' }))
  router.get('/alerts', prisonerProfileRedirect({ path: '/alerts' }))
  router.get('/case-notes', prisonerProfileRedirect({ path: '/case-notes' }))
  router.get('/sentence-and-release', prisonerProfileRedirect({ path: '/offences' }))
  router.get('/work-and-skills', prisonerProfileRedirect({ path: '/work-and-skills' }))
  router.get('/work-activities', workInsidePrison({ paginationService, prisonApi, esweService }))
  router.get('/schedule', prisonerSchedule({ prisonApi, logError }))

  router.get('/cell-history', prisonerProfileRedirect({ path: '/location-details' }))

  return router
}

export default (dependencies) => controller(dependencies)
