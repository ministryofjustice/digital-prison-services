const express = require('express')
const nunjucks = require('nunjucks')

const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook')
const prisonerFullImage = require('../controllers/prisonerProfile/prisonerFullImage')
const prisonerPersonal = require('../controllers/prisonerProfile/prisonerPersonal')
const prisonerAlerts = require('../controllers/prisonerProfile/prisonerAlerts')
const prisonerCaseNotes = require('../controllers/prisonerProfile/prisonerCaseNotes')
const prisonerSentenceAndRelease = require('../controllers/prisonerProfile/prisonerSentenceAndRelease')
const prisonerVisits = require('../controllers/prisonerProfile/prisonerVisits')
const prisonerSchedule = require('../controllers/prisonerProfile/prisonerSchedule')
const prisonerProfessionalContacts = require('../controllers/prisonerProfile/prisonerProfessionalContacts')
const prisonerCellHistory = require('../controllers/prisonerProfile/prisonerCellHistory')
const prisonerLocationHistory = require('../controllers/prisonerProfile/prisonerLocationHistory')
const prisonerAdjudicationDetails = require('../controllers/prisonerProfile/prisonerAdjudicationDetails')
const adjudicationsController = require('../controllers/prisonerProfile/adjudicationHistory')
const prisonerIncentiveLevelDetails = require('../controllers/prisonerProfile/prisonerIncentiveLevelDetails')
const prisonerChangeIncentiveLevelDetails = require('../controllers/prisonerProfile/prisonerChangeIncentiveLevelDetails')

const prisonerDamageObligations = require('../controllers/prisonerProfile/prisonerFinances/prisonerDamageObligations')

const prisonerProfileServiceFactory = require('../services/prisonerProfileService')
const personServiceFactory = require('../services/personService')
const paginationService = require('../services/paginationService')

const referenceCodesServiceFactory = require('../controllers/reference-codes-service')

const adjudicationsHistoryService = require('../services/adjudicationHistory')

const router = express.Router({ mergeParams: true })

const controller = ({
  prisonApi,
  keyworkerApi,
  oauthApi,
  caseNotesApi,
  allocationManagerApi,
  systemOauthClient,
  dataComplianceApi,
  pathfinderApi,
  logError,
  socApi,
  whereaboutsApi,
}) => {
  const prisonerProfileService = prisonerProfileServiceFactory({
    prisonApi,
    keyworkerApi,
    oauthApi,
    dataComplianceApi,
    pathfinderApi,
    systemOauthClient,
    socApi,
    allocationManagerApi,
  })
  const personService = personServiceFactory(prisonApi)
  const referenceCodesService = referenceCodesServiceFactory(prisonApi)
  const adjudicationHistoryService = adjudicationsHistoryService(prisonApi)

  router.get('/', prisonerQuickLook({ prisonerProfileService, prisonApi, logError }))
  router.get('/image', prisonerFullImage({ prisonApi, logError }))
  router.get(
    '/personal',
    prisonerPersonal({ prisonerProfileService, personService, prisonApi, allocationManagerApi, logError })
  )
  router.get(
    '/alerts',
    prisonerAlerts({ prisonerProfileService, referenceCodesService, paginationService, prisonApi, oauthApi, logError })
  )
  router.get(
    '/case-notes',
    prisonerCaseNotes({
      caseNotesApi,
      prisonerProfileService,
      prisonApi,
      paginationService,
      nunjucks,
      logError,
      oauthApi,
    })
  )
  router.get(
    '/sentence-and-release',
    prisonerSentenceAndRelease({ prisonerProfileService, prisonApi, systemOauthClient, logError })
  )
  router.get('/visits', prisonerVisits({ prisonApi, logError }))
  router.get('/schedule', prisonerSchedule({ prisonApi, logError }))
  router.get(
    '/professional-contacts',
    prisonerProfessionalContacts({ prisonApi, personService, allocationManagerApi, logError })
  )

  router.get('/cell-history', prisonerCellHistory({ oauthApi, prisonApi, logError }))
  router.get('/location-history', prisonerLocationHistory({ prisonApi, whereaboutsApi, caseNotesApi, logError }))

  router.get('/adjudications/:adjudicationNumber', prisonerAdjudicationDetails({ prisonApi, logError }))

  router.use(
    '/adjudications',
    adjudicationsController({
      adjudicationHistoryService,
      paginationService,
      prisonApi,
      logError,
    })
  )

  router.get('/incentive-level-details', prisonerIncentiveLevelDetails({ prisonApi, oauthApi, logError }))
  router.get(
    '/incentive-level-details/change-incentive-level',
    prisonerChangeIncentiveLevelDetails({ prisonApi, logError }).index
  )
  router.post(
    '/incentive-level-details/change-incentive-level',
    prisonerChangeIncentiveLevelDetails({ prisonApi, logError }).post
  )

  router.get('/prisoner-finance-details/damage-obligations', prisonerDamageObligations({ prisonApi, logError }))

  return router
}

module.exports = dependencies => controller(dependencies)
