const express = require('express')
const { isBinaryFileSync } = require('isbinaryfile')
const fs = require('fs')
const { bulkAppointmentsUploadFactory } = require('../../controllers/appointments/bulkAppointmentsUpload')
const { offenderLoaderFactory } = require('../../controllers/offender-loader')
const { csvParserService } = require('../../csv-parser')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  const { index, post } = bulkAppointmentsUploadFactory(
    csvParserService({ fs, isBinaryFileSync }),
    offenderLoaderFactory(elite2Api),
    elite2Api,
    logError
  )

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
