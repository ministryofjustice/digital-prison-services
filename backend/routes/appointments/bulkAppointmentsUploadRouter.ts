// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isBinaryFi... Remove this comment to see the full error message
const { isBinaryFileSync } = require('isbinaryfile')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bulkAppoin... Remove this comment to see the full error message
const { bulkAppointmentsUploadFactory } = require('../../controllers/appointments/bulkAppointmentsUpload')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'offenderLo... Remove this comment to see the full error message
const { offenderLoaderFactory } = require('../../controllers/offender-loader')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'csvParserS... Remove this comment to see the full error message
const { csvParserService } = require('../../csv-parser')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ prisonApi, logError }) => {
  const { index, post } = bulkAppointmentsUploadFactory(
    csvParserService({ fs, isBinaryFileSync }),
    offenderLoaderFactory(prisonApi),
    prisonApi,
    logError
  )

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
