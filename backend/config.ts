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
  neurodiversityEnabledUsernames: process.env.NEURODIVERSITY_ENABLED_USERNAMES,
  neurodiversityEnabledPrisons: process.env.NEURODIVERSITY_ENABLED_PRISONS || [],
  disableRequestLimiter: process.env.DISABLE_REQUEST_LIMITER ? process.env.DISABLE_REQUEST_LIMITER === 'true' : false,
  whereaboutsMaintenanceMode: process.env.WHEREABOUTS_MAINTENANCE_MODE === 'true' || false,
  keyworkerMaintenanceMode: process.env.KEYWORKER_MAINTENANCE_MODE === 'true' || false,
}

export const analytics = {
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleAnalyticsGa4Id: process.env.GOOGLE_ANALYTICS_GA4_ID,
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
  sendLegalMail: {
    url: process.env.SEND_LEGAL_MAIL_URL,
  },
}
export const apis = {
  oauth2: {
    url: process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
    ui_url: process.env.OAUTH_ENDPOINT_UI_URL || process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
    timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 30,
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
  incentivesApi: {
    url: process.env.INCENTIVES_API_ENDPOINT_URL || 'http://localhost:8087',
    timeoutSeconds: toNumber(process.env.INCENTIVES_API_ENDPOINT_TIMEOUT_SECONDS) || 30,
  },
  keyworker: {
    url: process.env.KEYWORKER_API_URL || 'http://localhost:8081/',
    timeoutSeconds: toNumber(process.env.KEYWORKER_API_TIMEOUT_SECONDS) || 30,
  },
  restrictedPatient: {
    url: process.env.RESTRICTED_PATIENT_API_URL || 'http://localhost:8089/',
    timeoutSeconds: toNumber(process.env.RESTRICTED_PATIENT_API_TIMEOUT_SECONDS) || 30,
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
  checkMyDiary: {
    ui_url: process.env.CHECK_MY_DIARY_URL,
  },
  incentives: {
    ui_url: process.env.INCENTIVES_URL,
    excludedCaseloads: process.env.INCENTIVES_EXCLUDED_CASELOADS || '',
  },
  calculateReleaseDates: {
    ui_url: process.env.CALCULATE_RELEASE_DATES_URL,
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
  welcomePeopleIntoPrison: {
    url: process.env.WELCOME_PEOPLE_INTO_PRISON_URL,
    enabled_prisons: process.env.WELCOME_PEOPLE_INTO_PRISON_ENABLED_PRISONS || '',
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
  manageAdjudications: {
    ui_url: process.env.MANAGE_ADJUDICATIONS_URL || '',
    enabled_prisons: process.env.PRISONS_WITH_MANAGE_ADJUDICATIONS_ENABLED || '',
  },
  manageRestrictedPatients: {
    ui_url: process.env.MANAGE_RESTRICTED_PATIENTS_URL || '',
  },
  managePrisonVisits: {
    ui_url: process.env.MANAGE_PRISON_VISITS_URL || '',
  },
  legacyPrisonVisits: {
    ui_url: process.env.LEGACY_PRISON_VISITS_URL || '',
  },
  secureSocialVideoCalls: {
    ui_url: process.env.SECURE_SOCIAL_VIDEO_CALLS_URL || '',
  },
  createAndVaryALicence: {
    url: process.env.CREATE_AND_VARY_A_LICENCE_URL,
    enabled_prisons: process.env.CREATE_AND_VARY_A_LICENCE_ENABLED_PRISONS || '',
  },
  historicalPrisonerApplication: {
    ui_url: process.env.HISTORICAL_PRISONER_APPLICATION_URL || '',
  },
  getSomeoneReadyForWork: {
    ui_url: process.env.GET_SOMEONE_READY_FOR_WORK_URL || 'http://localhost:3002',
  },
  manageWarrantFolder: {
    ui_url: process.env.WARRANT_FOLDER_URL,
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
    PBI: {
      omu: process.env.PETERBOROUGH_OMU_EMAIL,
    },
    BMI: {
      omu: process.env.BIRMINGHAM_OMU_EMAIL,
    },
    NWI: {
      omu: process.env.NORWICH_OMU_EMAIL,
    },
    PNI: {
      omu: process.env.PRESTON_OMU_EMAIL,
    },
    BZI: {
      omu: process.env.BRONZEFIELD_OMU_EMAIL,
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
