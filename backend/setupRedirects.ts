// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

module.exports = () => {
  router.get('/add-bulk-appointments', (req, res) => res.redirect(301, '/bulk-appointments/need-to-upload-file'))

  router.get('/content/support', (req, res) => res.redirect(301, config.app.supportUrl))

  router.get('/offenders/:offenderNo', (req, res) => res.redirect(301, `/prisoner/${req.params.offenderNo}`))

  router.get('/offenders/:offenderNo/adjudications', (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/adjudications`)
  )

  router.get('/offenders/:offenderNo/quick-look', (req, res) => res.redirect(301, `/prisoner/${req.params.offenderNo}`))

  router.get('/api/offenders/:offenderNo/adjudications/:adjudicationNumber', (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/adjudications/${req.params.adjudicationNumber}`)
  )

  router.get(['/offenders/:offenderNo/iep-details', '/offenders/:offenderNo/incentive-level-details'], (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/incentive-level-details`)
  )

  router.get('/videolink', (req, res) => {
    res.redirect(301, config.apis.bookVideoLink.url)
  })

  return router
}
