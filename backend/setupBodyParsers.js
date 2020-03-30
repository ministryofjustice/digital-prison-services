const express = require('express')
const bodyParser = require('body-parser')
const formData = require('express-form-data')
const os = require('os')

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
