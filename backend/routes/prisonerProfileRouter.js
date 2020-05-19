const express = require('express')
const nunjucks = require('nunjucks')

const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook')
const prisonerFullImage = require('../controllers/prisonerProfile/prisonerFullImage')
const prisonerPersonal = require('../controllers/prisonerProfile/prisonerPersonal')
const prisonerAlerts = require('../controllers/prisonerProfile/prisonerAlerts')
const prisonerCaseNotes = require('../controllers/prisonerProfile/prisonerCaseNotes')

const prisonerProfileServiceFactory = require('../services/prisonerProfileService')
const paginationService = require('../services/paginationService')
const referenceCodesServiceFactory = require('../controllers/reference-codes-service')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, keyworkerApi, oauthApi, caseNotesApi, logError }) => {
  const prisonerProfileService = prisonerProfileServiceFactory(elite2Api, keyworkerApi, oauthApi)
  const referenceCodesService = referenceCodesServiceFactory(elite2Api)

  router.get('/', prisonerQuickLook({ prisonerProfileService, elite2Api, logError }))
  router.get('/image', prisonerFullImage({ elite2Api, logError }))
  router.get('/personal', prisonerPersonal({ prisonerProfileService, elite2Api, logError }))
  router.get(
    '/alerts',
    prisonerAlerts({ prisonerProfileService, referenceCodesService, paginationService, elite2Api, logError })
  )
  router.get(
    '/case-notes',
    prisonerCaseNotes({ caseNotesApi, prisonerProfileService, elite2Api, paginationService, nunjucks, logError })
  )

  return router
}

module.exports = dependencies => controller(dependencies)
