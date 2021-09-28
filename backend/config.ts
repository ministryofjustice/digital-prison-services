const toNumber = (value: string | undefined): number | undefined => {
  const result = parseInt(value, 10)
  return Number.isSafeInteger(result) && result
}

export const app = {
  port: process.env.PORT || 3002,
  production: process.env.NODE_ENV === 'production',
  disableWebpack: process.env.DISABLE_WEBPACK === 'true',
  licencesUrl: process.env.LICENCES_URL || 'http://localhost:3003/',
  mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk',
  tokenRefreshThresholdSeconds: toNumber(process.env.TOKEN_REFRESH_THRESHOLD_SECONDS) || 60,
  url: process.env.PRISON_STAFF_HUB_UI_URL || `http://localhost:${process.env.PORT || 3002}/`,
  maximumFileUploadSizeInMb: toNumber(process.env.MAXIMUM_FILE_UPLOAD_SIZE_IN_MB) || 200,
  displayRetentionLink: process.env.DISPLAY_RETENTION_LINK === 'true' || false,
  supportUrl: process.env.SUPPORT_URL || 'http://localhost:3000/',
  contentfulSpaceId: process.env.CONTENTFUL_SPACE_ID || '1',
  contentfulAccessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '1',
  esweEnabled: process.env.ESWE_ENABLED === 'true',
}

export const analytics = {
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_ID,
}

export const hmppsCookie = {
  name: process.env.HMPPS_COOKIE_NAME || 'hmpps-session-dev',
  domain: process.env.HMPPS_COOKIE_DOMAIN || 'localhost',
  expiryMinutes: toNumber(process.env.WEB_SESSION_TIMEOUT_IN_MINUTES) || 60,
  sessionSecret: process.env.SESSION_COOKIE_SECRET || 'notm-insecure-session',
}

export const redis = {
  enabled: process.env.REDIS_ENABLED === 'true',
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
}
export const applications = {
  licences: {
    url: process.env.LICENCES_URL || 'http://localhost:3003/',
  },
  manageaccounts: {
    url: process.env.MANAGE_AUTH_ACCOUNTS_URL || 'http://localhost:3004/',
  },
  moic: {
    url: process.env.MOIC_URL,
  },
  pecs: {
    url:
      process.env.PECS_URL ||
      'https://hmpps-book-secure-move-frontend-staging.apps.live-1.cloud-platform.service.justice.gov.uk',
  },
}
export const apis = {
  oauth2: {
    url: process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
    ui_url: process.env.OAUTH_ENDPOINT_UI_URL || process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
    timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 10,
    clientId: process.env.API_CLIENT_ID || 'prisonapiclient',
    clientSecret: process.env.API_CLIENT_SECRET || 'clientsecret',
    systemClientId: process.env.API_SYSTEM_CLIENT_ID || 'prisonstaffhubclient',
    systemClientSecret: process.env.API_SYSTEM_CLIENT_SECRET || 'clientsecret',
  },
  prisonApi: {
    url: process.env.API_ENDPOINT_URL || 'http://localhost:8080/',
    timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 30,
  },
  whereabouts: {
    url: process.env.API_WHEREABOUTS_ENDPOINT_URL || 'http://localhost:8082/',
    timeoutSeconds: toNumber(process.env.API_WHEREABOUTS_ENDPOINT_TIMEOUT_SECONDS) || 30,
  },
  community: {
    url: process.env.API_COMMUNITY_ENDPOINT_URL || 'http://localhost:8083/communityapi',
    timeoutSeconds: toNumber(process.env.API_COMMUNITY_ENDPOINT_TIMEOUT_SECONDS) || 30,
    apiPrefix: process.env.API_COMMUNITY_API_PREFIX || '/api',
  },
  datacompliance: {
    url: process.env.API_DATA_COMPLIANCE_ENDPOINT_URL || 'http://localhost:8083/',
    timeoutSeconds: toNumber(process.env.API_DATA_COMPLIANCE_ENDPOINT_TIMEOUT_SECONDS) || 30,
  },
  keyworker: {
    url: process.env.KEYWORKER_API_URL || 'http://localhost:8081/',
    timeoutSeconds: toNumber(process.env.KEYWORKER_API_TIMEOUT_SECONDS) || 30,
  },
  tokenverification: {
    url: process.env.TOKENVERIFICATION_API_URL || 'http://localhost:8100',
    timeoutSeconds: toNumber(process.env.TOKENVERIFICATION_API_TIMEOUT_SECONDS) || 10,
    enabled: process.env.TOKENVERIFICATION_API_ENABLED === 'true',
  },
  categorisation: {
    ui_url: process.env.CATEGORISATION_UI_URL || 'http://localhost:3003/',
  },
  useOfForce: {
    ui_url: process.env.USE_OF_FORCE_URL,
    prisons: process.env.USE_OF_FORCE_PRISONS || '',
  },
  caseNotes: {
    url: process.env.CASENOTES_API_URL || 'http://localhost:8083',
    timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 30,
  },
  allocationManager: {
    url: process.env.ALLOCATION_MANAGER_ENDPOINT_URL || '',
    timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 30,
  },
  pathfinder: {
    url: process.env.PATHFINDER_ENDPOINT_API_URL || '',
    ui_url: process.env.PATHFINDER_UI_URL,
    timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 30,
  },
  soc: {
    url: process.env.SOC_API_URL || '',
    ui_url: process.env.SOC_UI_URL || '',
    timeoutSeconds: 10,
    enabled: process.env.SOC_API_ENABLED === 'true',
  },
  offenderSearch: {
    url: process.env.OFFENDER_SEARCH_API_URL || 'http://localhost:8085',
    timeoutSeconds: toNumber(process.env.OFFENDER_SEARCH_API_TIMEOUT_SECONDS) || 10,
  },
  bookVideoLink: {
    url: process.env.BVL_URL || 'http://localhost:3000',
  },
  omic: {
    url: process.env.OMIC_URL || 'http://localhost:3001',
  },
  complexity: {
    url: process.env.COMPLEXITY_OF_NEED_URI || '',
    timeoutSeconds: 10,
    enabled_prisons: process.env.PRISONS_WITH_OFFENDERS_THAT_HAVE_COMPLEX_NEEDS,
  },
  pinPhones: {
    ui_url: process.env.PIN_PHONES_URL || 'http://localhost:3000/',
  },
  curious: {
    url: process.env.CURIOUS_URL || '',
  },
}
export const notifications = {
  enabled: process.env.NOTIFY_ENABLED ? process.env.NOTIFY_ENABLED === 'true' : true,
  notifyKey: process.env.NOTIFY_API_KEY || '',
  confirmBookingPrisonTemplateId: '391bb0e0-89b3-4aef-b11e-c6550b71fee8',
  emails: {
    WWI: {
      omu: process.env.WANDSWORTH_OMU_EMAIL,
    },
    TSI: {
      omu: process.env.THAMESIDE_OMU_EMAIL,
    },
    HEI: {
      omu: process.env.HEWELL_OMU_EMAIL,
    },
    BWI: {
      omu: process.env.BERWYN_OMU_EMAIL,
    },
    NMI: {
      omu: process.env.NOTTINGHAM_OMU_EMAIL,
    },
    EYI: {
      omu: process.env.ELMLEY_OMU_EMAIL,
    },
    BNI: {
      omu: process.env.BULLINGDON_OMU_EMAIL,
    },
  },
}

export const phaseName = process.env.SYSTEM_PHASE

export default {
  app,
  analytics,
  hmppsCookie,
  redis,
  applications,
  apis,
  notifications,
  phaseName,
}
