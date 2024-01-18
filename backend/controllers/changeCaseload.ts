import { Request, Response } from 'express'

export default (prisonApi, logError, systemOauthClient) => {
  const index = async (req: Partial<Request>, res: Partial<Response>) => {
    const {
      user: { allCaseloads },
    } = res.locals

    if (allCaseloads.length <= 1) {
      return res.redirect('/')
    }

    const options = allCaseloads.map((caseload) => ({ value: caseload.caseLoadId, text: caseload.description }))
    let backUrl: string

    if (req.headers.referer) {
      const referer = new URL(req.headers.referer)
      if (!referer.pathname.match(/\/change-caseload\/?/)) {
        backUrl = req.headers.referer
      }
    }

    return res.render('changeCaseload.njk', {
      title: 'Change your location',
      options,
      backUrl,
    })
  }

  const post = async (req: Partial<Request>, res: Partial<Response>) => {
    const { caseLoadId } = req.body

    // Don't call API if data is missing
    if (caseLoadId) {
      const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
      await prisonApi.setActiveCaseload(systemContext, { caseLoadId })

      if (req.session && req.session.userDetails) req.session.userDetails.activeCaseLoadId = caseLoadId
      if (req.session && req.session.data) req.session.data = null

      res.redirect('/')
    } else {
      logError(req.originalUrl, 'Caseload ID is missing')
      res.status(500)
      res.render('error.njk', {
        url: '/change-caseload',
      })
    }
  }

  return { index, post }
}
