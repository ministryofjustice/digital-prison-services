const express = require('express')
const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook')
const prisonerFullImage = require('../controllers/prisonerProfile/prisonerFullImage')
const prisonerPersonal = require('../controllers/prisonerProfile/prisonerPersonal')
const prisonerAlerts = require('../controllers/prisonerProfile/prisonerAlerts')
const prisonerProfileServiceFactory = require('../services/prisonerProfileService')
const referenceCodesServiceFactory = require('../controllers/reference-codes-service')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, keyworkerApi, oauthApi, logError }) => {
  const prisonerProfileService = prisonerProfileServiceFactory(elite2Api, keyworkerApi, oauthApi)
  const referenceCodesService = referenceCodesServiceFactory(elite2Api)

  router.get('/', prisonerQuickLook({ prisonerProfileService, elite2Api, logError }))
  router.get('/image', prisonerFullImage({ elite2Api, logError }))
  router.get('/personal', prisonerPersonal({ prisonerProfileService, elite2Api, logError }))
  router.get('/alerts', prisonerAlerts({ prisonerProfileService, referenceCodesService, elite2Api, logError }))

  return router
}

module.exports = dependencies => controller(dependencies)
