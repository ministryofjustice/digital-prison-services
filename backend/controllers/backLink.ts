import config from '../config'

const sanitizeUrl = (url: string) => (url?.endsWith('/') ? url.substring(0, url.length - 1) : url)

export interface RegisteredService {
  name: string
  hostname: string
  defaultBackLinkText: string
}

export const registeredBackLinkServices = [
  {
    name: 'digital-prison-services',
    hostname: '',
    defaultBackLinkText: 'View most recent search',
  },
  {
    name: 'welcome-people-into-prison',
    hostname: sanitizeUrl(config.apis.welcomePeopleIntoPrison.url),
    defaultBackLinkText: 'Back to Welcome people into prison',
  },
] as Array<RegisteredService>

export const saveBackLink = (registeredServices: Array<RegisteredService>) => async (req, res) => {
  const { service, returnResource, toResource, backLinkText } = req.query

  if (!service || !returnResource || !toResource) throw new Error('Required query parameters missing')

  const userBackLink = registeredServices.find((e) => e.name === service)
  if (!userBackLink) throw new Error(`Could not find service: [${service}]`)

  req.session.userBackLink = {
    url: userBackLink.hostname + returnResource,
    text: backLinkText || userBackLink.defaultBackLinkText,
  }
  res.redirect(toResource)
}
