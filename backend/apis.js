const config = require('./config')
const clientFactory = require('./api/oauthEnabledClient')
const { elite2ApiFactory } = require('./api/elite2Api')
const { oauthApiFactory } = require('./api/oauthApi')
const { whereaboutsApiFactory } = require('./api/whereaboutsApi')
const { communityApiFactory } = require('./api/communityApi')
const { dataComplianceApiFactory } = require('./api/dataComplianceApi')
const { keyworkerApiFactory } = require('./api/keyworkerApi')
const { caseNotesApiFactory } = require('./api/caseNotesApi')
const { allocationManagerApiFactory } = require('./api/allocationManagerApi')
const { tokenVerificationApiFactory } = require('./api/tokenVerificationApi')
const { pathfinderApiFactory } = require('./api/pathfinderApi')
const { socApiFactory } = require('./api/socApi')
const { offenderSearchApiFactory } = require('./api/offenderSearchApi')

const elite2Api = elite2ApiFactory(
  clientFactory({
    baseUrl: config.apis.elite2.url,
    timeout: config.apis.elite2.timeoutSeconds * 1000,
  })
)

const whereaboutsApi = whereaboutsApiFactory(
  clientFactory({
    baseUrl: config.apis.whereabouts.url,
    timeout: config.apis.whereabouts.timeoutSeconds * 1000,
  })
)

const communityApi = communityApiFactory(
  clientFactory({
    baseUrl: config.apis.community.url,
    timeout: config.apis.community.timeoutSeconds * 1000,
  }),
  config.apis.community.apiPrefix
)

const oauthApi = oauthApiFactory(
  clientFactory({
    baseUrl: config.apis.oauth2.url,
    timeout: config.apis.oauth2.timeoutSeconds * 1000,
  }),
  { ...config.apis.oauth2 }
)

const dataComplianceApi = dataComplianceApiFactory(
  clientFactory({
    baseUrl: config.apis.datacompliance.url,
    timeout: config.apis.datacompliance.timeoutSeconds * 1000,
  })
)

const keyworkerApi = keyworkerApiFactory(
  clientFactory({
    baseUrl: config.apis.keyworker.url,
    timeout: config.apis.keyworker.timeoutSeconds * 1000,
  })
)

const caseNotesApi = caseNotesApiFactory(
  clientFactory({
    baseUrl: config.apis.caseNotes.url,
    timeout: config.apis.caseNotes.timeoutSeconds * 1000,
  })
)

const tokenVerificationApi = tokenVerificationApiFactory(
  clientFactory({
    baseUrl: config.apis.tokenverification.url,
    timeout: config.apis.tokenverification.timeoutSeconds * 1000,
  })
)

const allocationManagerApi = allocationManagerApiFactory(
  clientFactory({
    baseUrl: config.apis.allocationManager.url,
    timeout: config.apis.allocationManager.timeoutSeconds * 1000,
  })
)

const pathfinderApi = pathfinderApiFactory(
  clientFactory({
    baseUrl: config.apis.pathfinder.url,
    timeout: config.apis.pathfinder.timeoutSeconds * 1000,
  })
)

const socApi = socApiFactory(
  clientFactory({
    baseUrl: config.apis.soc.url,
    timeout: config.apis.soc.timeoutSeconds * 1000,
  })
)

const offenderSearchApi = offenderSearchApiFactory(
  clientFactory({
    baseUrl: config.apis.offenderSearch.url,
    timeout: config.apis.offenderSearch.timeoutSeconds * 1000,
  })
)

module.exports = {
  elite2Api,
  whereaboutsApi,
  oauthApi,
  communityApi,
  dataComplianceApi,
  keyworkerApi,
  caseNotesApi,
  tokenVerificationApi,
  allocationManagerApi,
  pathfinderApi,
  socApi,
  offenderSearchApi,
}
