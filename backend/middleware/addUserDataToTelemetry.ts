import { Request, Response } from 'express'
import { telemetryMiddleware } from '@ministryofjustice/hmpps-azure-telemetry'

export default telemetryMiddleware.addUserMetadataToTelemetry({
  getAttributes: (req: Request, res: Response) => {
    const { username, activeCaseLoad } = res.locals.user || {}

    return username
      ? {
          username,
          activeCaseLoadId: activeCaseLoad?.caseLoadId,
          referer: req.headers.referer,
        }
      : {}
  },
})
