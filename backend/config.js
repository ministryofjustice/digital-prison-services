module.exports = {
  app: {
    production: process.env.NODE_ENV === 'production',
    notmEndpointUrl: process.env.NN_ENDPOINT_URL || 'http://localhost:3000/',
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk'
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID
  },
  hmppsCookie: {
    name: process.env.HMPPS_COOKIE_NAME || 'hmpps-session-dev',
    domain: process.env.HMPPS_COOKIE_DOMAIN || 'localhost',
    expiryMinutes: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES || 20
  }
};
