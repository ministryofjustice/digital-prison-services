import express from 'express'
import prisonerSearchController from '../controllers/search/prisonerSearch'
import paginationService from '../services/paginationService'
import telemetry from '../azure-appinsights'
import prisonerSearchRedirect from '../controllers/search/prisonerSearchRedirect'

const router = express.Router()

const controller = ({ prisonApi, offenderSearchApi, logError, systemOauthClient }) => {
  const { post } = prisonerSearchController({
    paginationService,
    prisonApi,
    offenderSearchApi,
    telemetry,
    logError,
    systemOauthClient,
  })
  router.get('/', prisonerSearchRedirect())
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
