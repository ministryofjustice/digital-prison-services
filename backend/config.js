module.exports = {
  app: {
    production: process.env.NODE_ENV === 'production',
    notmEndpointUrl: process.env.NN_ENDPOINT_URL || 'http://localhost:3000/',
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk',
    tokenRefreshThresholdSeconds: process.env.TOKEN_REFRESH_THRESHOLD_SECONDS || 60,
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  },
  hmppsCookie: {
    name: process.env.HMPPS_COOKIE_NAME || 'hmpps-session-dev',
    domain: process.env.HMPPS_COOKIE_DOMAIN || 'localhost',
    expiryMinutes: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES || 20,
    sessionSecret: process.env.SESSION_SECRET || 'insecure-default-session',
  },
  apis: {
    oauth2: {
      url: process.env.OAUTH_ENDPOINT_URL || process.env.API_ENDPOINT_URL || 'http://localhost:9090/auth',
      timeoutSeconds: process.env.API_ENDPOINT_TIMEOUT_SECONDS || 10,
      clientId: process.env.API_CLIENT_ID || 'elite2apiclient',
      clientSecret: process.env.API_CLIENT_SECRET || 'clientsecret',
    },
    elite2: {
      url: process.env.API_ENDPOINT_URL || 'http://localhost:8080/',
      timeoutSeconds: process.env.API_ENDPOINT_TIMEOUT_SECONDS || 30,
    },
  },
}
