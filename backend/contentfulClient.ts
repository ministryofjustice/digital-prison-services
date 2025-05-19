import * as contentful from 'contentful'
import config from './config'

export default contentful.createClient({
  space: config.app.contentfulSpaceId,
  accessToken: config.app.contentfulAccessToken,
})
