import CuriousApi from './api/curious/curiousApi'
import clientFactory from './api/oauthEnabledClient'

import config from './config'
import { prisonApiFactory } from './api/prisonApi'
import { oauthApiFactory } from './api/oauthApi'
import { whereaboutsApiFactory } from './api/whereaboutsApi'
import { communityApiFactory } from './api/communityApi'
import { dataComplianceApiFactory } from './api/dataComplianceApi'
import { keyworkerApiFactory } from './api/keyworkerApi'
import { caseNotesApiFactory } from './api/caseNotesApi'
import { allocationManagerApiFactory } from './api/allocationManagerApi'
import { tokenVerificationApiFactory } from './api/tokenVerificationApi'
import { pathfinderApiFactory } from './api/pathfinderApi'
import { socApiFactory } from './api/socApi'
import { offenderSearchApiFactory } from './api/offenderSearchApi'
import { complexityApiFactory } from './api/complexityApi'
import { incentivesApiFactory } from './api/incentivesApi'

export const prisonApi = prisonApiFactory(
  clientFactory({
    baseUrl: config.apis.prisonApi.url,
    timeout: config.apis.prisonApi.timeoutSeconds * 1000,
  })
)

export const whereaboutsApi = whereaboutsApiFactory(
  clientFactory({
    baseUrl: config.apis.whereabouts.url,
    timeout: config.apis.whereabouts.timeoutSeconds * 1000,
  })
)

export const communityApi = communityApiFactory(
  clientFactory({
    baseUrl: config.apis.community.url,
    timeout: config.apis.community.timeoutSeconds * 1000,
  }),
  config.apis.community.apiPrefix
)

export const oauthApi = oauthApiFactory(
  clientFactory({
    baseUrl: config.apis.oauth2.url,
    timeout: config.apis.oauth2.timeoutSeconds * 1000,
  }),
  { ...config.apis.oauth2 }
)

export const dataComplianceApi = dataComplianceApiFactory(
  clientFactory({
    baseUrl: config.apis.datacompliance.url,
    timeout: config.apis.datacompliance.timeoutSeconds * 1000,
  })
)

export const keyworkerApi = keyworkerApiFactory(
  clientFactory({
    baseUrl: config.apis.keyworker.url,
    timeout: config.apis.keyworker.timeoutSeconds * 1000,
  })
)

export const caseNotesApi = caseNotesApiFactory(
  clientFactory({
    baseUrl: config.apis.caseNotes.url,
    timeout: config.apis.caseNotes.timeoutSeconds * 1000,
  })
)

export const tokenVerificationApi = tokenVerificationApiFactory(
  clientFactory({
    baseUrl: config.apis.tokenverification.url,
    timeout: config.apis.tokenverification.timeoutSeconds * 1000,
  })
)

export const allocationManagerApi = allocationManagerApiFactory(
  clientFactory({
    baseUrl: config.apis.allocationManager.url,
    timeout: config.apis.allocationManager.timeoutSeconds * 1000,
  })
)

export const pathfinderApi = pathfinderApiFactory(
  clientFactory({
    baseUrl: config.apis.pathfinder.url,
    timeout: config.apis.pathfinder.timeoutSeconds * 1000,
  })
)

export const socApi = socApiFactory(
  clientFactory({
    baseUrl: config.apis.soc.url,
    timeout: config.apis.soc.timeoutSeconds * 1000,
  })
)

export const offenderSearchApi = offenderSearchApiFactory(
  clientFactory({
    baseUrl: config.apis.offenderSearch.url,
    timeout: config.apis.offenderSearch.timeoutSeconds * 1000,
  })
)

export const complexityApi = complexityApiFactory(
  clientFactory({
    baseUrl: config.apis.complexity.url,
    timeout: config.apis.complexity.timeoutSeconds * 1000,
  })
)

export const incentivesApi = incentivesApiFactory(
  clientFactory({
    baseUrl: config.apis.incentivesApi.url,
    timeout: config.apis.incentivesApi.timeoutSeconds * 1000,
  })
)

export const curiousApi = CuriousApi.create(clientFactory({ baseUrl: config.apis.curious.url }))

export default {
  prisonApi,
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
  complexityApi,
  curiousApi,
  incentivesApi,
}
