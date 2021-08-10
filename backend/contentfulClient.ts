import { createClient } from 'contentful'
import config from './config'

export default createClient({
  space: config.app.contentfulSpaceId,
  accessToken: config.app.contentfulAccessToken,
})
