require('dotenv').config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights')

const express = require('express')

const app = express()

const path = require('path')
const apis = require('./apis')
const config = require('./config')
const routes = require('./routes')

const setupWebSession = require('./setupWebSession')
const setupHealthChecks = require('./setupHealthChecks')
const setupBodyParsers = require('./setupBodyParsers')
const setupWebSecurity = require('./setupWebSecurity')
const setupAuth = require('./setupAuth')
const setupSass = require('./setupSass')
const setupStaticContent = require('./setupStaticContent')
const setupWebpackForDev = require('./setupWebpackForDev')

app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'ejs')
app.set('view engine', 'njk')

app.use(setupBodyParsers())
app.use(setupHealthChecks())
app.use(setupWebSecurity())
app.use(setupWebSession())
app.use(setupAuth({ oauthApi: apis.oauthApi }))
app.use(setupSass())
app.use(setupWebpackForDev())

app.use(routes(apis))

app.use(setupStaticContent({ app }))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.listen(config.app.port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', config.app.port)
})
