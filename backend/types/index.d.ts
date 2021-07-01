declare namespace prisonstaffhub {
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
    session: session.Session & Partial<session.SessionData> & prisonstaffhub.UserSession
  }
}
