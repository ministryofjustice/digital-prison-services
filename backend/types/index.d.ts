declare namespace digitalprisonservices {
  interface UserSession {
    userDetails: {
      activeCaseLoadId: string
      staffId: string
    }
  }
}

declare namespace Express {
  import session = require('express-session')

  interface Request {
    session: session.Session & Partial<session.SessionData> & digitalprisonservices.UserSession
    csrfToken?: () => string
    flash(): { [key: string]: unknown[] }
    flash(type: string, message: unknown): number
    flash(message: string): unknown[]
  }
}
