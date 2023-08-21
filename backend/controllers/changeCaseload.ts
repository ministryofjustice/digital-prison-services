export const changeCaseloadFactory = (prisonApi, logError) => {
  const index = (req, res) => {
    const {
      user: { allCaseloads },
    } = res.locals

    if (allCaseloads.length <= 1) {
      return res.redirect('/')
    }

    const options = allCaseloads.map((caseload) => ({ value: caseload.caseLoadId, text: caseload.description }))
    let backUrl: string
    const referer = new URL(req.headers.referer)

    if (!referer.pathname.match(/\/change-caseload\/?/)) {
      backUrl = req.headers.referer
    }

    return res.render('changeCaseload.njk', {
      title: 'Change your location',
      options,
      backUrl,
    })
  }

  const post = async (req, res) => {
    const { caseLoadId } = req.body

    // Don't call API if data is missing
    if (caseLoadId) {
      await prisonApi.setActiveCaseload(res.locals, { caseLoadId })

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

export default {
  changeCaseloadFactory,
}
