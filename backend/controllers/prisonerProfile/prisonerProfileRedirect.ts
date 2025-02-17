import config from '../../config'
import logger from '../../log'

export default ({ path, handler }) => {
  return async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId, authSource } = req.session.userDetails
    const isInaccessibleFrom = config.app.prisonerProfileRedirect.oldPrisonerProfileInaccessibleFrom
    const isInaccessible = isInaccessibleFrom && isInaccessibleFrom < Date.now()

    if (activeCaseLoadId) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    if (isInaccessible) {
      logger.info(`User '${res.locals?.user?.username}' has no caseload, presenting no caseload message`)
      const homepageUrl = authSource === 'nomis' ? config.app.homepageRedirect.url : config.apis.oauth2.url
      const homepageLinkText = authSource === 'nomis' ? 'DPS homepage' : 'HMPPS Digital Services homepage'
      return res.render('prisonerProfile/noCaseloads.njk', { homepageUrl, homepageLinkText })
    }

    return handler(req, res, next)
  }
}
