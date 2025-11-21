import express from 'express'
import EsweService from '../services/esweService'
import prisonerSchedule from '../controllers/prisonerProfile/prisonerSchedule'
import prisonerProfessionalContacts from '../controllers/prisonerProfile/prisonerProfessionalContacts'
import personServiceFactory from '../services/personService'
import paginationService from '../services/paginationService'
import learnerEmployabilitySkills from '../controllers/prisonerProfile/learnerEmployabilitySkillsDetails'
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
  allocationManagerApi,
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
  const personService = personServiceFactory(prisonApi)
  const esweService = EsweService.create(curiousApi, systemOauthClient, prisonApi, whereaboutsApi)

  router.get('/', prisonerProfileRedirect({ path: '/' }))

  router.get('/image', prisonerProfileRedirect({ path: '/image' }))

  router.get('/personal', prisonerProfileRedirect({ path: '/personal' }))
  router.get('/alerts', prisonerProfileRedirect({ path: '/alerts' }))
  router.get('/case-notes', prisonerProfileRedirect({ path: '/case-notes' }))
  router.get('/sentence-and-release', prisonerProfileRedirect({ path: '/offences' }))
  router.get('/work-and-skills', prisonerProfileRedirect({ path: '/work-and-skills' }))
  router.get('/skills', learnerEmployabilitySkills({ paginationService, prisonApi, esweService }))
  router.get('/work-activities', workInsidePrison({ paginationService, prisonApi, esweService }))
  router.get('/schedule', prisonerSchedule({ prisonApi, logError }))
  router.get(
    '/professional-contacts',
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; personService:... Remove this comment to see the full error message
    prisonerProfessionalContacts({ prisonApi, personService, allocationManagerApi, systemOauthClient, logError })
  )

  router.get('/cell-history', prisonerProfileRedirect({ path: '/location-details' }))

  return router
}

export default (dependencies) => controller(dependencies)
