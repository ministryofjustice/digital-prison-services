import express from 'express'
import bodyParser from 'body-parser'
import formData from 'express-form-data'
import os from 'os'

const router = express.Router()

export default () => {
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
