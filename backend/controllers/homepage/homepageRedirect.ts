import { NextFunction, Request, RequestHandler, Response } from 'express'
import config from '../../config'

// This now redirects all users to the new homepage regardless of caseload
export default (_handler: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return res.redirect(`${config.app.homepageRedirect.url}`)
  }
