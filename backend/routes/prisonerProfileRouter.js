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

const prisonerProfileServiceFactory = require('../services/prisonerProfileService')
const personServiceFactory = require('../services/personService')
const paginationService = require('../services/paginationService')
const referenceCodesServiceFactory = require('../controllers/reference-codes-service')

const adjudicationsHistoryService = require('../services/adjudicationHistory')

const router = express.Router({ mergeParams: true })

const controller = ({
  elite2Api,
  keyworkerApi,
  oauthApi,
  caseNotesApi,
  allocationManagerApi,
  systemOauthClient,
  dataComplianceApi,
  pathfinderApi,
  logError,
  socApi,
}) => {
  const prisonerProfileService = prisonerProfileServiceFactory({
    elite2Api,
    keyworkerApi,
    oauthApi,
    dataComplianceApi,
    pathfinderApi,
    systemOauthClient,
    socApi,
    allocationManagerApi,
  })
  const personService = personServiceFactory(elite2Api)
  const referenceCodesService = referenceCodesServiceFactory(elite2Api)
  const adjudicationHistoryService = adjudicationsHistoryService(elite2Api)

  router.get('/', prisonerQuickLook({ prisonerProfileService, elite2Api, logError }))
  router.get('/image', prisonerFullImage({ elite2Api, logError }))
  router.get(
    '/personal',
    prisonerPersonal({ prisonerProfileService, personService, elite2Api, allocationManagerApi, logError })
  )
  router.get(
    '/alerts',
    prisonerAlerts({ prisonerProfileService, referenceCodesService, paginationService, elite2Api, oauthApi, logError })
  )
  router.get(
    '/case-notes',
    prisonerCaseNotes({ caseNotesApi, prisonerProfileService, elite2Api, paginationService, nunjucks, logError })
  )
  router.get(
    '/sentence-and-release',
    prisonerSentenceAndRelease({ prisonerProfileService, elite2Api, systemOauthClient, logError })
  )
  router.get('/visits', prisonerVisits({ elite2Api, logError }))
  router.get('/schedule', prisonerSchedule({ elite2Api, logError }))
  router.get(
    '/professional-contacts',
    prisonerProfessionalContacts({ elite2Api, personService, allocationManagerApi, logError })
  )

  router.get('/cell-history', prisonerCellHistory({ oauthApi, elite2Api, logError }))
  router.get('/location-history', prisonerLocationHistory({ elite2Api, logError }))

  router.get('/adjudications/:adjudicationNumber', prisonerAdjudicationDetails({ elite2Api, logError }))

  router.use(
    '/adjudications',
    adjudicationsController({
      adjudicationHistoryService,
      paginationService,
      elite2Api,
      logError,
    })
  )

  return router
}

module.exports = dependencies => controller(dependencies)
