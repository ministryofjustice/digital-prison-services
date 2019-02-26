require('dotenv').config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights')

const path = require('path')
const os = require('os')
const express = require('express')
const cookieSession = require('cookie-session')
const passport = require('passport')
const bodyParser = require('body-parser')
const bunyanMiddleware = require('bunyan-middleware')
const hsts = require('hsts')
const helmet = require('helmet')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const hrm = require('webpack-hot-middleware')
const flash = require('connect-flash')
const formData = require('express-form-data')

const ensureHttps = require('./middleware/ensureHttps')
const userCaseLoadsFactory = require('./controllers/usercaseloads').userCaseloadsFactory
const setActiveCaseLoadFactory = require('./controllers/setactivecaseload').activeCaseloadFactory
const { userLocationsFactory } = require('./controllers/userLocations')
const { userMeFactory } = require('./controllers/userMe')
const { getConfiguration } = require('./controllers/getConfig')
const houseblockLocationsFactory = require('./controllers/houseblockLocations').getHouseblockLocationsFactory
const activityLocationsFactory = require('./controllers/activityLocations').getActivityLocationsFactory
const activityListFactory = require('./controllers/activityList').getActivityListFactory
const houseblockListFactory = require('./controllers/houseblockList').getHouseblockListFactory
const { healthFactory } = require('./controllers/health')
const { updateAttendanceFactory } = require('./controllers/updateAttendance')
const establishmentRollFactory = require('./controllers/establishmentRollCount').getEstablishmentRollCountFactory
const { movementsServiceFactory } = require('./controllers/movementsService')
const { globalSearchFactory } = require('./controllers/globalSearch')
const { prisonerImageFactory } = require('./controllers/prisonerImage')
const { offenderLoaderFactory } = require('./controllers/offender-loader')
const bulkAppointmentsServiceFactory = require('./controllers/bulk-appointments-service')

const sessionManagementRoutes = require('./sessionManagementRoutes')
const auth = require('./auth')
const contextProperties = require('./contextProperties')

const tokenRefresherFactory = require('./tokenRefresher').factory
const controllerFactory = require('./controllers/controller').factory

const clientFactory = require('./api/oauthEnabledClient')
const { elite2ApiFactory } = require('./api/elite2Api')
const { oauthApiFactory } = require('./api/oauthApi')
const oauthClientId = require('./api/oauthClientId')

const log = require('./log')
const config = require('./config')

const app = express()
const sixtyDaysInSeconds = 5184000

app.set('trust proxy', 1) // trust first proxy

app.set('view engine', 'ejs')

app.use(helmet())

app.use(
  formData.parse({
    uploadDir: os.tmpdir(),
    autoClean: true,
  })
)

app.use(
  hsts({
    maxAge: sixtyDaysInSeconds,
    includeSubDomains: true,
    preload: true,
  })
)

app.use(
  bunyanMiddleware({
    logger: log,
    obscureHeaders: ['Authorization'],
  })
)

const { health } = healthFactory(config.apis.elite2.url)
app.use('/health', health)
app.use('/info', health)

if (config.app.production) {
  app.use(ensureHttps)
}

// Don't cache dynamic resources
app.use(helmet.noCache())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '../build/static')))

app.get('/terms', async (req, res) => {
  res.render('terms', { mailTo: config.app.mailTo, homeLink: config.app.notmEndpointUrl })
})

const elite2Api = elite2ApiFactory(
  clientFactory({
    baseUrl: config.apis.elite2.url,
    timeout: config.apis.elite2.timeoutSeconds * 1000,
  })
)

const controller = controllerFactory({
  activityListService: activityListFactory(elite2Api),
  houseblockListService: houseblockListFactory(elite2Api),
  updateAttendanceService: updateAttendanceFactory(elite2Api),
  establishmentRollService: establishmentRollFactory(elite2Api),
  globalSearchService: globalSearchFactory(elite2Api),
  movementsService: movementsServiceFactory(elite2Api, oauthClientId),
  offenderLoader: offenderLoaderFactory(elite2Api),
  bulkAppoinemtnsService: bulkAppointmentsServiceFactory(elite2Api),
})

const oauthApi = oauthApiFactory(
  clientFactory({
    baseUrl: config.apis.oauth2.url,
    timeout: config.apis.oauth2.timeoutSeconds * 1000,
  }),
  { ...config.apis.oauth2 }
)
auth.init()
const tokenRefresher = tokenRefresherFactory(oauthApi.refresh, config.app.tokenRefreshThresholdSeconds)

app.use(
  cookieSession({
    name: config.hmppsCookie.name,
    domain: config.hmppsCookie.domain,
    maxAge: config.hmppsCookie.expiryMinutes * 60 * 1000,
    secure: config.app.production,
    httpOnly: true,
    signed: true,
    keys: [config.hmppsCookie.sessionSecret],
    overwrite: true,
    sameSite: 'lax',
  })
)

// Ensure cookie session is extended (once per minute) when user interacts with the server
app.use((req, res, next) => {
  // eslint-disable-next-line no-param-reassign
  req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
  next()
})

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

/* login, logout, token refresh etc */
sessionManagementRoutes.configureRoutes({
  app,
  tokenRefresher,
  mailTo: config.app.mailTo,
  homeLink: config.app.notmEndpointUrl,
})

const compiler = webpack(require('../webpack.config.js'))

if (config.app.production === false) {
  app.use(middleware(compiler, { writeToDisk: true }))
  app.use(hrm(compiler, {}))
}

// Extract pagination header information from requests and set on the 'context'
app.use('/api', (req, res, next) => {
  contextProperties.setRequestPagination(res.locals, req.headers)
  next()
})

app.use(express.static(path.join(__dirname, '../build')))

app.use('/api/config', getConfiguration)
app.use('/api/userroles', userMeFactory(oauthApi).userRoles)
app.use('/api/me', userMeFactory(oauthApi).userMe)
app.use('/api/usercaseloads', userCaseLoadsFactory(elite2Api).userCaseloads)
app.use('/api/userLocations', userLocationsFactory(elite2Api).userLocations)
app.use('/api/setactivecaseload', setActiveCaseLoadFactory(elite2Api).setActiveCaseload)
app.use('/api/houseblockLocations', houseblockLocationsFactory(elite2Api).getHouseblockLocations)
app.use('/api/activityLocations', activityLocationsFactory(elite2Api).getActivityLocations)
app.use('/api/houseblocklist', controller.getHouseblockList)
app.use('/api/activityList', controller.getActivityList)
app.use('/api/updateAttendance', controller.updateAttendance)
app.use('/api/establishmentRollCount', controller.getEstablishmentRollCount)
app.use('/api/movements/:agencyId/in', controller.getMovementsIn)
app.use('/api/movements/:agencyId/out', controller.getMovementsOut)
app.use('/api/movements/:agencyId/in-reception', controller.getOffendersInReception)
app.use('/api/movements/livingUnit/:livingUnitId/currently-out', controller.getOffendersCurrentlyOutOfLivingUnit)
app.use('/api/movements/agency/:agencyId/currently-out', controller.getOffendersCurrentlyOutOfAgency)
app.use('/api/movements/:agencyId/en-route', controller.getOffendersEnRoute)
app.use('/api/globalSearch', controller.globalSearch)
app.use('/api/appointments/upload-offenders', controller.uploadOffenders)
app.get('/app/images/:offenderNo/data', prisonerImageFactory(elite2Api).prisonerImage)
app.get('/api/bulk-appointments/view-model', controller.getBulkAppointmentsViewModel)
app.post('/api/bulk-appointments', controller.addBulkAppointments)
app.get('/bulk-appointments/csv-template', controller.bulkAppointmentsCsvTemplate)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})
