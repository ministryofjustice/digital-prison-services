import config from '../../config'

export default async (req, res, next) => {
  const { service, returnPath, redirectPath, backLinkText } = req.query

  let url = `${config.app.prisonerProfileRedirect.url}/save-backlink?service=${service}&returnPath=${encodeURIComponent(
    returnPath
  )}&redirectPath=${redirectPath}`
  if (backLinkText) {
    url += `&backLinkText=${backLinkText}`
  }
  return res.redirect(url)
}
