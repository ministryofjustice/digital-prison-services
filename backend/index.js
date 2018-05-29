require('dotenv').config();

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights');

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bunyanMiddleware = require('bunyan-middleware');
const hsts = require('hsts');
const helmet = require('helmet');
const ensureHttps = require('./middleware/ensureHttps');

const authentication = require('./controllers/authentication');
const userCaseLoads = require('./controllers/usercaseloads');
const setActiveCaseLoad = require('./controllers/setactivecaseload');
const userLocations = require('./controllers/userLocations');
const locations = require('./controllers/activities');
const userMe = require('./controllers/userMe');
const getConfig = require('./controllers/getConfig');
const houseblockLocations = require('./controllers/houseblockLocations');
const activityList = require('./controllers/activityList');
const houseblockList = require('./controllers/houseblockList');
const health = require('./controllers/health');
const clientVersionValidator = require('./validate-client-version');
const applicationVersion = require('./application-version');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const hrm = require('webpack-hot-middleware');

const log = require('./log');
const config = require('./config');
const session = require('./session');

const app = express();
const sixtyDaysInSeconds = 5184000;
const sessionExpiryMinutes = config.session.expiryMinutes * 60 * 1000;

const sessionConfig = {
  name: config.session.name,
  secret: config.session.secret,
  sameSite: true,
  expires: new Date(Date.now() + sessionExpiryMinutes),
  maxAge: sessionExpiryMinutes
};

app.set('trust proxy', 1); // trust first proxy

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(helmet());

app.use(hsts({
  maxAge: sixtyDaysInSeconds,
  includeSubDomains: true,
  preload: true
}));

app.use(bunyanMiddleware({
  logger: log,
  obscureHeaders: ['Authorization']
}));

app.use('/health', health);
app.use('/info', health);

if (config.app.production) {
  app.use(ensureHttps);
}

app.use(cookieParser());
app.use(cookieSession(sessionConfig));

// Don't cache dynamic resources
app.use(helmet.noCache());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../build/static')));

app.use('/auth', session.loginMiddleware, authentication);
app.use(session.hmppsSessionMiddleWare);
app.use(session.extendHmppsCookieMiddleWare);


if (config.app.production === false) {
  const compiler = webpack(require('../webpack.config.js'));
  app.use(middleware(compiler, {}));
  app.use(hrm(compiler, {}));
}


// Update a value in the cookie so that the set-cookie will be sent.
// Only changes every minute so that it's not sent with every request.
app.use((req, res, next) => {
  req.session.nowInMinutes = session.getNowInMinutes();
  next();
});

app.use(express.static(path.join(__dirname, '../build')));

//app.use(express.static(path.join(__dirname, '../public'), { index: 'dummy-file-which-doesnt-exist' })); // TODO: setting the index to false doesn't seem to work
//app.use(express.static(path.join(__dirname, '../build'), { index: 'dummy-file-which-doesnt-exist' }));

app.use(clientVersionValidator);

app.use((req, res, next) => {
  // Keep track of when a server update occurs. Changes rarely.
  req.session.applicationVersion = applicationVersion.buildNumber;
  next();
});


app.use('/api/me', userMe);
app.use('/api/usercaseloads', userCaseLoads);
app.use('/api/setactivecaseload', setActiveCaseLoad);
app.use('/api/userLocations', userLocations);
app.use('/api/houseblockLocations', houseblockLocations);
app.use('/api/houseblocklist', houseblockList.router);
app.use('/api/locations', locations);
app.use('/api/activityList', activityList.router);

app.use('/api/config', getConfig);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});


const port = process.env.PORT || 3001;

app.listen(port, function () {
  console.log('Backend running on port', port);
});
