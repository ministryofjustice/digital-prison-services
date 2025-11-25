import express from 'express'
import prisonerSearchController from '../controllers/search/prisonerSearch'
import paginationService from '../services/paginationService'
import telemetry from '../azure-appinsights'

const router = express.Router()

const controller = ({ prisonApi, offenderSearchApi, logError, systemOauthClient }) => {
  const { index, post } = prisonerSearchController({
    paginationService,
    prisonApi,
    offenderSearchApi,
    telemetry,
    logError,
    systemOauthClient,
  })
  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
