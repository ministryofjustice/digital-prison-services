import './bootstrap'

import './azure-appinsights'

import express from 'express'
import 'express-async-errors'

import csrf from 'csurf'
import cookieParser from 'cookie-parser'

import apis from './apis'
import config from './config'
import routes from './routes'
import setupWebSession from './setupWebSession'
import setupHealthChecks from './setupHealthChecks'
import setupBodyParsers from './setupBodyParsers'
import setupWebSecurity from './setupWebSecurity'
import setupAuth from './setupAuth'
import {
  clientCredsSetup,
  enableLogDebugStatements,
  getSystemOauthApiClient,
  getTokenStore,
} from './api/systemOauthClient'
import setupStaticContent from './setupStaticContent'
import nunjucksSetup from './utils/nunjucksSetup'
import setupRedirects from './setupRedirects'
import setupApiRoutes from './setupApiRoutes'
import setupReactRoutes from './setupReactRoutes'
import phaseNameSetup from './phaseNameSetup'
import currentUser from './middleware/currentUser'
import returnUrl from './middleware/returnUrl'
import pageNotFound from './setUpPageNotFound'
import errorHandler from './middleware/errorHandler'
import { logError } from './logError'
import homepageController from './controllers/homepage/homepage'
import requestLimiter from './middleware/requestLimiter'
import homepageRedirect from './controllers/homepage/homepageRedirect'
import getFrontendComponents, { feComponentsRoutes } from './middleware/getFeComponents'

// We do not want the server to exit, partly because any log information will be lost.
// Instead, log the error so we can trace, diagnose and fix the problem.
process.on('uncaughtException', (err, origin) => {
  logError('uncaughtException', err, origin)
})
process.on('unhandledRejection', (reason, promise) => {
  logError(`unhandledRejection`, {}, `Unhandled Rejection at: ${promise} reason: ${reason}`)
})

const app = express()

app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'njk')

nunjucksSetup(app)
phaseNameSetup(app, config)
clientCredsSetup(getTokenStore(config), getSystemOauthApiClient(config), enableLogDebugStatements(config))

app.use(cookieParser())
app.use(setupBodyParsers())
app.use(setupHealthChecks())
app.use(setupWebSecurity())
app.use(setupRedirects())
app.use(setupStaticContent())
app.use(setupWebSession())
app.use(setupAuth({ oauthApi: apis.oauthApi, tokenVerificationApi: apis.tokenVerificationApi }))

app.use(currentUser({ prisonApi: apis.prisonApi, hmppsManageUsersApi: apis.hmppsManageUsersApi }))
app.get(feComponentsRoutes, getFrontendComponents({ feComponentsApi: apis.feComponentsApi }))
app.use(returnUrl())

if (!config.app.disableWebpack) {
  // eslint-disable-next-line global-require
  app.use(require('./setupWebpackForDev').default())
}

if (!config.app.disableRequestLimiter) app.use(requestLimiter())

app.use(
  setupApiRoutes({
    prisonApi: apis.prisonApi,
    whereaboutsApi: apis.whereaboutsApi,
    oauthApi: apis.oauthApi,
    hmppsManageUsersApi: apis.hmppsManageUsersApi,
    caseNotesApi: apis.caseNotesApi,
  })
)
app.use(csrf())
app.use((req, res, next) => {
  if (typeof req.csrfToken === 'function') {
    res.locals.csrfToken = req.csrfToken()
  }
  next()
})

app.use(
  routes({
    prisonApi: apis.prisonApi,
    whereaboutsApi: apis.whereaboutsApi,
    oauthApi: apis.oauthApi,
    hmppsManageUsersApi: apis.hmppsManageUsersApi,
    communityApi: apis.communityApi,
    dataComplianceApi: apis.dataComplianceApi,
    keyworkerApi: apis.keyworkerApi,
    caseNotesApi: apis.caseNotesApi,
    allocationManagerApi: apis.allocationManagerApi,
    pathfinderApi: apis.pathfinderApi,
    socApi: apis.socApi,
    offenderSearchApi: apis.offenderSearchApi,
    complexityApi: apis.complexityApi,
    curiousApi: apis.curiousApi,
    incentivesApi: apis.incentivesApi,
    nonAssociationsApi: apis.nonAssociationsApi,
    restrictedPatientApi: apis.restrictedPatientApi,
    adjudicationsApi: apis.adjudicationsApi,
    whereaboutsMaintenanceMode: config.app.whereaboutsMaintenanceMode,
  })
)
app.use(setupReactRoutes())
app.use('/$', homepageRedirect(homepageController({ ...apis, logError })))
app.use(pageNotFound)
app.use(errorHandler({ logError }))

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})
