import { RegisteredService, saveBackLink } from '../controllers/backLink'

const wpipUrl = 'https://wpip'
jest.mock('../config', () => ({ apis: { welcomePeopleIntoPrison: { url: wpipUrl } } }))

const registeredServices = [
  {
    name: 'welcome-people-into-prison',
    hostname: wpipUrl,
    defaultBackLinkText: 'Back to Welcome people into prison',
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
    [undefined, '/returnResource', '/toResource'],
    ['service', undefined, '/toResource'],
    ['service', '/returnResource', undefined],
    [undefined, undefined, '/toResource'],
    [undefined, '/returnResource', undefined],
    ['service', undefined, undefined],
    [undefined, undefined, undefined],
  ])('should throw error if required parameters are missing', async (service, returnResource, toResource) => {
    req.query = {
      service,
      returnResource,
      toResource,
    }
    await expect(controller(req, res)).rejects.toThrow('Required query parameters missing')
  })

  it('should throw error if service is not registered', async () => {
    req.query = {
      service: 'service',
      returnResource: '/returnResource',
      toResource: '/toResource',
      backLinkText: 'backLinkText',
    }
    await expect(controller(req, res)).rejects.toThrow('Could not find service: [service]')
  })

  it('should save text as as provided backlink text', async () => {
    req.query = {
      service: 'welcome-people-into-prison',
      returnResource: '/returnResource',
      toResource: '/toResource',
      backLinkText: 'backLinkText',
    }
    await controller(req, res)
    expect(req.session.userBackLink).toEqual({
      text: 'backLinkText',
      url: `${wpipUrl}/returnResource`,
    })
  })

  it.each([['welcome-people-into-prison', 'Back to Welcome people into prison', `${wpipUrl}/returnResource`]])(
    'should save text as default when not provided',
    async (service, defaultBackLinkText, returnUrl) => {
      req.query = {
        service,
        returnResource: '/returnResource',
        toResource: '/toResource',
      }
      await controller(req, res)
      expect(req.session.userBackLink).toEqual({
        text: defaultBackLinkText,
        url: returnUrl,
      })
    }
  )
})
