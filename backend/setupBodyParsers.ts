import express from 'express'

const router = express.Router()

export default () => {
  router.use(express.urlencoded({ extended: false, limit: '5mb', parameterLimit: 1000000 }))
  router.use(express.json({ limit: '1mb' }))

  return router
}
