import express from 'express'
import globalSearchController from '../controllers/globalSearch'
import paginationService from '../services/paginationService'
import telemetry from '../azure-appinsights'
import globalSearchRedirect from '../controllers/search/globalSearchRedirect'

const router = express.Router()

const controller = ({ offenderSearchApi, oauthApi, logError }) => {
  const { indexPage, resultsPage } = globalSearchController({
    paginationService,
    offenderSearchApi,
    oauthApi,
    telemetry,
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ paginationService: { getPagina... Remove this comment to see the full error message
    logError,
  })

  router.get('/', globalSearchRedirect({ path: 'global-search' }), indexPage)
  router.get('/results', globalSearchRedirect({ path: 'global-search/results' }), resultsPage)

  return router
}

export default (dependencies) => controller(dependencies)
