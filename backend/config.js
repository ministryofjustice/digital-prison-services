module.exports = {
  app: {
    port: process.env.PORT || 3002,
    production: process.env.NODE_ENV === 'production',
    disableWebpack: process.env.DISABLE_WEBPACK === 'true',
    notmEndpointUrl: process.env.NN_ENDPOINT_URL || 'http://localhost:3000/',
    licencesUrl: process.env.LICENCES_URL || 'http://localhost:3003/',
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk',
    tokenRefreshThresholdSeconds: process.env.TOKEN_REFRESH_THRESHOLD_SECONDS || 60,
    url: process.env.PRISON_STAFF_HUB_UI_URL || `http://localhost:${process.env.PORT || 3002}/`,
    maximumFileUploadSizeInMb: process.env.MAXIMUM_FILE_UPLOAD_SIZE_IN_MB || 200,
    featureFlags: {},
    videoLinkEnabledFor: (process.env.VIDEO_LINK_ENABLED_FOR || '').split(','),
    displayRetentionLink: process.env.DISPLAY_RETENTION_LINK === 'true' || false,
    supportUrl: process.env.SUPPORT_URL || 'http://localhost:3000/',
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  },
  hmppsCookie: {
    name: process.env.HMPPS_COOKIE_NAME || 'hmpps-session-dev',
    domain: process.env.HMPPS_COOKIE_DOMAIN || 'localhost',
    expiryMinutes: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES || 60,
    sessionSecret: process.env.SESSION_COOKIE_SECRET || 'notm-insecure-session',
  },
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  apis: {
    oauth2: {
      url: process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
      ui_url: process.env.OAUTH_ENDPOINT_UI_URL || process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
      timeoutSeconds: process.env.API_ENDPOINT_TIMEOUT_SECONDS || 10,
      clientId: process.env.API_CLIENT_ID || 'elite2apiclient',
      clientSecret: process.env.API_CLIENT_SECRET || 'clientsecret',
      systemClientId: process.env.API_SYSTEM_CLIENT_ID || 'prisonstaffhubclient',
      systemClientSecret: process.env.API_SYSTEM_CLIENT_SECRET || 'clientsecret',
    },
    elite2: {
      url: process.env.API_ENDPOINT_URL || 'http://localhost:8080/',
      timeoutSeconds: process.env.API_ENDPOINT_TIMEOUT_SECONDS || 30,
    },
    whereabouts: {
      url: process.env.API_WHEREABOUTS_ENDPOINT_URL || 'http://localhost:8082/',
      timeoutSeconds: process.env.API_WHEREABOUTS_ENDPOINT_TIMEOUT_SECONDS || 30,
    },
    community: {
      url: process.env.API_COMMUNITY_ENDPOINT_URL || 'http://localhost:8083/communityapi',
      timeoutSeconds: process.env.API_COMMUNITY_ENDPOINT_TIMEOUT_SECONDS || 30,
      apiPrefix: process.env.API_COMMUNITY_API_PREFIX || '/api',
    },
    datacompliance: {
      url: process.env.API_DATA_COMPLIANCE_ENDPOINT_URL || 'http://localhost:8083/',
      timeoutSeconds: process.env.API_DATA_COMPLIANCE_ENDPOINT_TIMEOUT_SECONDS || 30,
    },
    keyworker: {
      url: process.env.KEYWORKER_API_URL || 'http://localhost:8081/',
      timeoutSeconds: process.env.KEYWORKER_API_TIMEOUT_SECONDS || 30,
    },
    tokenverification: {
      url: process.env.TOKENVERIFICATION_API_URL || 'http://localhost:8100',
      timeoutSeconds: process.env.TOKENVERIFICATION_API_TIMEOUT_SECONDS || 10,
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
      timeoutSeconds: process.env.API_ENDPOINT_TIMEOUT_SECONDS || 30,
    },
    allocationManager: {
      url: process.env.ALLOCATION_MANAGER_ENDPOINT_URL || '',
      timeoutSeconds: process.env.API_ENDPOINT_TIMEOUT_SECONDS || 30,
    },
    pathfinder: {
      url: process.env.PATHFINDER_ENDPOINT_API_URL || '',
      ui_url: process.env.PATHFINDER_UI_URL,
      timeoutSeconds: process.env.API_ENDPOINT_TIMEOUT_SECONDS || 30,
    },
    soc: {
      url: process.env.SOC_URL || '',
      timeoutSeconds: 10,
      enabled: process.env.SOC_API_ENABLED === 'true',
    },
    offenderSearch: {
      url: process.env.OFFENDER_SEARCH_API_URL || 'http://localhost:8085',
      timeoutSeconds: process.env.OFFENDER_SEARCH_API_TIMEOUT_SECONDS || 10,
    },
  },

  notifications: {
    enabled: process.env.NOTIFY_ENABLED ? process.env.NOTIFY_ENABLED === 'true' : true,
    notifyKey: process.env.NOTIFY_API_KEY || '',
    confirmBookingPrisonTemplateId: '391bb0e0-89b3-4aef-b11e-c6550b71fee8',
    confirmBookingCourtTemplateId: '7f44cd94-4a74-4b9d-aff8-386fec34bd2e',
    prisonCourtBookingTemplateId: '2b156491-3a7b-4bb4-ad1c-9ccfb4949fd9',
    requestBookingCourtTemplateVLBAdminId: 'c1008f55-c228-4cad-b6fd-fe931c993855',
    requestBookingCourtTemplateRequesterId: '02da54de-a564-4af8-8e6b-b141a85acf87',
    emails: {
      WWI: {
        omu: process.env.WANDSWORTH_OMU_EMAIL,
        vlb: process.env.WANDSWORTH_VLB_EMAIL,
      },
    },
  },
}
