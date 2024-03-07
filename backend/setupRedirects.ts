import express from 'express'
import config from './config'

const router = express.Router()

export default () => {
  router.get('/add-bulk-appointments', (req, res) => res.redirect(301, '/bulk-appointments/need-to-upload-file'))

  router.get('/content/support', (req, res) => res.redirect(301, config.app.supportUrl))

  router.get('/offenders/:offenderNo', (req, res) => res.redirect(301, `/prisoner/${req.params.offenderNo}`))

  router.get('/offenders/:offenderNo/quick-look', (req, res) => res.redirect(301, `/prisoner/${req.params.offenderNo}`))

  router.get(['/offenders/:offenderNo/iep-details', '/offenders/:offenderNo/incentive-level-details'], (req, res) =>
    res.redirect(301, `${config.apis.incentives.ui_url}/incentive-reviews/prisoner/${req.params.offenderNo}/`)
  )

  router.get('/videolink', (req, res) => {
    res.redirect(301, config.apis.bookVideoLink.url)
  })

  return router
}
