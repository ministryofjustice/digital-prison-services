const express = require('express')

const router = express.Router()

module.exports = () => {
  router.get('/add-bulk-appointments', (req, res) => {
    return res.redirect(301, '/bulk-appointments/need-to-upload-file')
  })

  return router
}
