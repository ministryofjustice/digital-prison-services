import type { RequestHandler } from 'express'

import logger from '../log'
import { type feComponentsApiFactory } from '../api/feComponents'

export const feComponentsRoutes = /^(?!\/(api|app\/image|bulk-appointments|save-backlink)).*/

export default function getFrontendComponents({
  feComponentsApi,
  latestFeatures,
}: {
  feComponentsApi: ReturnType<typeof feComponentsApiFactory>
  latestFeatures: boolean
}): RequestHandler {
  return async (req, res, next) => {
    try {
      const { header, footer } = await feComponentsApi.getComponents(res.locals, ['header', 'footer'], latestFeatures)

      res.locals.feComponents = {
        header: header.html,
        footer: footer.html,
        cssIncludes: [...header.css, ...footer.css],
        jsIncludes: [...header.javascript, ...footer.javascript],
      }

      return next()
    } catch (error) {
      logger.error(error, 'Failed to retrieve front end components')
      return next()
    }
  }
}
