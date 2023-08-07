import { NextFunction, Request, RequestHandler, Response } from 'express'
import config from '../../config'

const isRedirectEnabled = (activeCaseLoadId: string): boolean => {
  const redirectUrl = config.app.homepageRedirect.url
  const redirectDate = config.app.homepageRedirect.enabledDate
  const caseloadScheduled = config.app.homepageRedirect.scheduleRedirectForPrisons
    ?.split(',')
    ?.includes(activeCaseLoadId)

  return redirectUrl && ((caseloadScheduled && redirectDate < Date.now()) || !caseloadScheduled)
}

const isRedirectCaseLoad = (activeCaseLoadId: string): boolean => {
  return config.app.homepageRedirect.enabledPrisons?.split(',')?.includes(activeCaseLoadId)
}

export default (handler: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { activeCaseLoadId } = req.session.userDetails

    const redirectEnabled = isRedirectEnabled(activeCaseLoadId)
    const redirectCaseload = isRedirectCaseLoad(activeCaseLoadId)

    if (redirectEnabled && redirectCaseload) {
      return res.redirect(`${config.app.homepageRedirect.url}`)
    }

    return handler(req, res, next)
  }
