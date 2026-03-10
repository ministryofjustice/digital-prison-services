import express from 'express'
import changeCaseloadFactory from '../controllers/changeCaseload'
import changeCaseloadRedirect from '../controllers/changeCaseloadRedirect'

const router = express.Router()

const controller = ({ prisonApi, logError, systemOauthClient }) => {
  const { index, post } = changeCaseloadFactory(prisonApi, logError, systemOauthClient)

  router.get('/', changeCaseloadRedirect({ path: 'change-caseload' }), index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
