import { RegisteredService, saveBackLink } from '../controllers/backLink'

const wpipUrl = 'https://wpip'
const dpsUrl = 'https://dps'

const registeredServices = [
  {
    name: 'welcome-people-into-prison',
    hostname: wpipUrl,
    defaultBackLinkText: 'Back to Welcome people into prison',
  },
  {
    name: 'digital-prison-services',
    hostname: dpsUrl,
    defaultBackLinkText: 'View most recent search',
  },
] as Array<RegisteredService>

describe('saveBackLink', () => {
  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      session: {},
    }
    res = {
      locals: {},
      redirect: jest.fn(),
    }

    controller = saveBackLink(registeredServices)
  })

  it.each([
    [undefined, '/returnPath', '/redirectPath'],
    ['service', undefined, '/redirectPath'],
    ['service', '/returnPath', undefined],
    [undefined, undefined, '/redirectPath'],
    [undefined, '/returnPath', undefined],
    ['service', undefined, undefined],
    [undefined, undefined, undefined],
  ])('should throw error if required parameters are missing', async (service, returnPath, redirectPath) => {
    req.query = {
      service,
      returnPath,
      redirectPath,
    }
    await expect(controller(req, res)).rejects.toThrow('Required query parameters missing')
  })

  it('should throw error if service is not registered', async () => {
    req.query = {
      service: 'service',
      returnPath: '/returnPath',
      redirectPath: '/redirectPath',
      backLinkText: 'backLinkText',
    }
    await expect(controller(req, res)).rejects.toThrow('Could not find service: [service]')
  })

  it('should save text as as provided backlink text', async () => {
    req.query = {
      service: 'welcome-people-into-prison',
      returnPath: '/returnPath',
      redirectPath: '/redirectPath',
      backLinkText: 'backLinkText',
    }
    await controller(req, res)
    expect(req.session.userBackLink).toEqual({
      text: 'backLinkText',
      url: `${wpipUrl}/returnPath`,
    })
  })

  it('should save text as default when not provided', async () => {
    const registeredService = registeredServices[0]

    req.query = {
      service: registeredService.name,
      returnPath: '/returnPath',
      redirectPath: '/redirectPath',
    }
    await controller(req, res)
    expect(req.session.userBackLink).toEqual({
      text: registeredService.defaultBackLinkText,
      url: `${registeredService.hostname}/returnPath`,
    })
  })
})
