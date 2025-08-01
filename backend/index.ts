import './bootstrap'

import './azure-appinsights'

import express from 'express'
import 'express-async-errors'

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
  getClientCredentialsTokens,
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
import requestLimiter from './middleware/requestLimiter'
import homepageRedirect from './controllers/homepage/homepageRedirect'
import getFrontendComponents, { feComponentsRoutes } from './middleware/getFeComponents'
import setUpCsrf from './middleware/setUpCsrf'
import multipartRouter from './routes/multipartRouter'

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

nunjucksSetup(app, config)
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

app.use(
  currentUser({ prisonApi: apis.prisonApi, hmppsManageUsersApi: apis.hmppsManageUsersApi, getClientCredentialsTokens })
)
app.get(
  feComponentsRoutes,
  getFrontendComponents({
    feComponentsApi: apis.feComponentsApi,
    latestFeatures: config.apis.frontendComponents.latestFeatures,
  })
)
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
    locationsInsidePrisonApi: apis.locationsInsidePrisonApi,
    oauthApi: apis.oauthApi,
    getClientCredentialsTokens,
    hmppsManageUsersApi: apis.hmppsManageUsersApi,
    caseNotesApi: apis.caseNotesApi,
    prisonerAlertsApi: apis.prisonerAlertsApi,
  })
)

// Routes that use multer for multipart upload must be registered before csrf executes
app.use(multipartRouter('/bulk-appointments/upload-file'))

app.use(setUpCsrf())
app.use(
  routes({
    prisonApi: apis.prisonApi,
    prisonerAlertsApi: apis.prisonerAlertsApi,
    whereaboutsApi: apis.whereaboutsApi,
    bookAVideoLinkApi: apis.bookAVideoLinkApi,
    locationsInsidePrisonApi: apis.locationsInsidePrisonApi,
    oauthApi: apis.oauthApi,
    hmppsManageUsersApi: apis.hmppsManageUsersApi,
    deliusIntegrationApi: apis.deliusIntegrationApi,
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
    nomisMapping: apis.nomisMapping,
    whereaboutsMaintenanceMode: config.app.whereaboutsMaintenanceMode,
    getClientCredentialsTokens,
  })
)
app.use(setupReactRoutes())
app.use('/$', homepageRedirect())
app.use(pageNotFound)
app.use(errorHandler({ logError }))

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})
