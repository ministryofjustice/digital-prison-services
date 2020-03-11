const express = require('express')
const { requestBookingFactory } = require('./requestBooking')

const router = express.Router({ mergeParams: true })

const controller = ({ logError, notifyClient, whereaboutsApi, oauthApi, elite2Api }) => {
  const {
    startOfJourney,
    checkAvailability,
    enterOffenderDetails,
    validateOffenderDetails,
    selectCourt,
    createBookingRequest,
    confirm,
  } = requestBookingFactory({
    logError,
    notifyClient,
    whereaboutsApi,
    oauthApi,
    elite2Api,
  })

  router.get('/', startOfJourney)
  router.post('/check-availability', checkAvailability)
  router.get('/enter-offender-details', enterOffenderDetails)
  router.post('/validate-offender-details', validateOffenderDetails)
  router.get('/select-court', selectCourt)
  router.post('/create-booking-request', createBookingRequest)
  router.get('/confirmation', confirm)

  return router
}

module.exports = dependencies => controller(dependencies)
