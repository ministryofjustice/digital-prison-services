const contentful = require('contentful')
const config = require('./config')

module.exports = contentful.createClient({
  space: config.app.contentfulSpaceId,
  accessToken: config.app.contentfulAccessToken,
})
