const express = require('express')
const config = require('./config')

const router = express.Router()

module.exports = () => {
  router.get('/add-bulk-appointments', (req, res) => {
    return res.redirect(301, '/bulk-appointments/need-to-upload-file')
  })

  router.get('/content/support', (req, res) => res.redirect(301, config.app.supportUrl))

  router.get('/offenders/:offenderNo/adjudications', (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/adjudications`)
  )

  router.get('/api/offenders/:offenderNo/adjudications/:adjudicationNumber', (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/adjudications/${req.params.adjudicationNumber}`)
  )

  router.get(['/offenders/:offenderNo/iep-details', '/offenders/:offenderNo/incentive-level-details'], (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/incentive-level-details`)
  )

  if (config.app.featureFlags.redirectToBookingVideoLinkEnabled) {
    const bvlRoutes = [
      '/offenders/:offenderNo/confirm-appointment',
      '/:agencyId/offenders/:offenderNo/add-court-appointment',
      '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court',
      '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
      '/videolink/prisoner-search',
      '/videolink',
      '/videolink/bookings',
      '/request-booking',
    ]

    bvlRoutes.forEach(route => {
      router.use(route, (req, res) => {
        res.redirect(`${config.apis.bookVideoLink.url}${req.originalUrl}`)
        res.end()
      })
    })
  }

  return router
}
