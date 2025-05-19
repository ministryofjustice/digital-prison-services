import express from 'express'
import changeCaseloadFactory from '../controllers/changeCaseload'

const router = express.Router()

const controller = ({ prisonApi, logError, systemOauthClient }) => {
  const { index, post } = changeCaseloadFactory(prisonApi, logError, systemOauthClient)

  router.get('/', index)
  router.post('/', post)
  return router
}

export default (dependencies) => controller(dependencies)
