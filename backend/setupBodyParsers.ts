// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bodyParser... Remove this comment to see the full error message
const bodyParser = require('body-parser')
const formData = require('express-form-data')
const os = require('os')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

module.exports = () => {
  router.use(
    formData.parse({
      uploadDir: os.tmpdir(),
      autoClean: true,
    })
  )
  router.use(bodyParser.urlencoded({ extended: false, limit: '5mb', parameterLimit: 1000000 }))
  router.use(bodyParser.json({ limit: '1mb' }))

  return router
}
