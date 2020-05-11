const express = require('express')
const prisonerQuickLook = require('../controllers/prisonerProfile/prisonerQuickLook')
const prisonerFullImage = require('../controllers/prisonerProfile/prisonerFullImage')
const prisonerPersonal = require('../controllers/prisonerProfile/prisonerPersonal')
const prisonerProfileServiceFactory = require('../services/prisonerProfileService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, keyworkerApi, oauthApi, logError }) => {
  const prisonerProfileService = prisonerProfileServiceFactory(elite2Api, keyworkerApi, oauthApi)

  router.get('/', prisonerQuickLook({ prisonerProfileService, elite2Api, logError }))
  router.get('/image', prisonerFullImage({ elite2Api, logError }))
  router.get('/personal', prisonerPersonal({ prisonerProfileService, elite2Api, logError }))
  router.get('/alerts', prisonerPersonal({ prisonerProfileService, elite2Api, logError }))

  return router
}

module.exports = dependencies => controller(dependencies)
