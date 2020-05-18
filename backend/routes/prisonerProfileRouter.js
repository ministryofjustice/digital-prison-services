const express = require('express')
const nunjucks = require('nunjucks')

const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook')
const prisonerFullImage = require('../controllers/prisonerProfile/prisonerFullImage')
const prisonerPersonal = require('../controllers/prisonerProfile/prisonerPersonal')
const prisonerCaseNotes = require('../controllers/prisonerProfile/prisonerCaseNotes')

const prisonerProfileServiceFactory = require('../services/prisonerProfileService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, keyworkerApi, oauthApi, caseNotesApi, logError }) => {
  const prisonerProfileService = prisonerProfileServiceFactory(elite2Api, keyworkerApi, oauthApi)

  router.get('/', prisonerQuickLook({ prisonerProfileService, elite2Api, logError }))
  router.get('/image', prisonerFullImage({ elite2Api, logError }))
  router.get('/personal', prisonerPersonal({ prisonerProfileService, elite2Api, logError }))
  router.get('/case-notes', prisonerCaseNotes({ caseNotesApi, prisonerProfileService, elite2Api, nunjucks }))

  return router
}

module.exports = dependencies => controller(dependencies)
