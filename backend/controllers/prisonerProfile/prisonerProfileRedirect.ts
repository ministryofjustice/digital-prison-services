import config from '../../config'
import logger from '../../log'

export default ({ path }) => {
  return async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId, authSource } = req.session.userDetails

    if (activeCaseLoadId) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    logger.info(`User '${res.locals?.user?.username}' has no caseload, presenting no caseload message`)
    const homepageUrl = authSource === 'nomis' ? config.app.homepageRedirect.url : config.apis.oauth2.url
    const homepageLinkText = authSource === 'nomis' ? 'DPS homepage' : 'HMPPS Digital Services homepage'
    return res.render('prisonerProfile/noCaseloads.njk', { homepageUrl, homepageLinkText })
  }
}
