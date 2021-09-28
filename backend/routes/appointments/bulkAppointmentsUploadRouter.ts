import express from 'express'
import { isBinaryFileSync } from 'isbinaryfile'
import fs from 'fs'
import { bulkAppointmentsUploadFactory } from '../../controllers/appointments/bulkAppointmentsUpload'
import { offenderLoaderFactory } from '../../controllers/offender-loader'
import { csvParserService } from '../../csv-parser'

const router = express.Router()

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

export default (dependencies) => controller(dependencies)
