const express = require('express')
const nunjucks = require('nunjucks')

const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook')
const prisonerFullImage = require('../controllers/prisonerProfile/prisonerFullImage')
const prisonerPersonal = require('../controllers/prisonerProfile/prisonerPersonal')
const prisonerAlerts = require('../controllers/prisonerProfile/prisonerAlerts')
const prisonerCaseNotes = require('../controllers/prisonerProfile/prisonerCaseNotes')
const prisonerSentenceAndRelease = require('../controllers/prisonerProfile/prisonerSentenceAndRelease')

const prisonerProfileServiceFactory = require('../services/prisonerProfileService')
const personServiceFactory = require('../services/personService')
const paginationService = require('../services/paginationService')
const referenceCodesServiceFactory = require('../controllers/reference-codes-service')

const router = express.Router({ mergeParams: true })

const controller = ({
  elite2Api,
  keyworkerApi,
  oauthApi,
  caseNotesApi,
  allocationManagerApi,
  systemOauthClient,
  logError,
}) => {
  const prisonerProfileService = prisonerProfileServiceFactory(elite2Api, keyworkerApi, oauthApi)
  const personService = personServiceFactory(elite2Api)
  const referenceCodesService = referenceCodesServiceFactory(elite2Api)

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

  return router
}

module.exports = dependencies => controller(dependencies)
