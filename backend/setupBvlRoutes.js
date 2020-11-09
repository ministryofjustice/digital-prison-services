const express = require('express')
const config = require('./config')
const addCourtAppointmentRouter = require('./routes/appointments/courtRouter')
const selectCourtAppointmentRooms = require('./routes/appointments/selectCourtAppointmentRoomsRouter')
const selectCourtAppointmentCourt = require('./routes/appointments/selectCourtAppointmentCourtRouter')
const viewCourtBookingsRouter = require('./routes/appointments/viewCourtBookingsRouter')
const requestBookingRouter = require('./routes/appointments/requestBookingRouter')
const confirmAppointmentRouter = require('./routes/appointments/confirmAppointmentRouter')
const videolinkPrisonerSearchController = require('./controllers/videolink/search/videolinkPrisonerSearch')

const router = express.Router()

module.exports = ({ prisonApi, whereaboutsApi, oauthApi, notifyClient, logError }) => {
  if (config.app.featureFlags.redirectToBookingVideoLinkEnabled) {
    router.use('/videolink', (req, res) => {
      res.redirect(`${config.apis.bookVideoLink.url}`)
    })
  } else {
    router.use('/offenders/:offenderNo/confirm-appointment', confirmAppointmentRouter({ prisonApi, logError }))

    router.use(
      '/:agencyId/offenders/:offenderNo/add-court-appointment',
      addCourtAppointmentRouter({ prisonApi, logError })
    )
    router.use(
      '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court',
      selectCourtAppointmentCourt({ prisonApi, whereaboutsApi, logError })
    )

    router.use(
      '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
      selectCourtAppointmentRooms({ prisonApi, whereaboutsApi, logError, oauthApi, notifyClient })
    )

    router.get('/videolink/prisoner-search', videolinkPrisonerSearchController({ oauthApi, prisonApi, logError }))

    router.get('/videolink', async (req, res) => {
      res.render('courtsVideolink.njk', {
        user: { displayName: req.session.userDetails.name },
        homeUrl: '/videolink',
      })
    })

    router.use('/videolink/bookings', viewCourtBookingsRouter({ prisonApi, whereaboutsApi, logError }))

    router.use(
      '/request-booking',
      requestBookingRouter({ logError, notifyClient, whereaboutsApi, oauthApi, prisonApi })
    )
  }
  return router
}
