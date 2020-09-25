const express = require('express')
const config = require('./config')

const router = express.Router()

module.exports = () => {
  router.get('/add-bulk-appointments', (req, res) => {
    return res.redirect(301, '/bulk-appointments/need-to-upload-file')
  })

  router.get('/content/support', (req, res) => res.redirect(301, config.app.supportUrl))

  return router
}
