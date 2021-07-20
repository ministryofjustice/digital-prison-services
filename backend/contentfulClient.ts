const contentful = require('contentful')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

module.exports = contentful.createClient({
  space: config.app.contentfulSpaceId,
  accessToken: config.app.contentfulAccessToken,
})
