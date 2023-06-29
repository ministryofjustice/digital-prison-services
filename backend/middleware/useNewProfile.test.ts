import useNewProfile from './useNewProfile'
import config, { parseDate } from '../config'

interface Res {
  locals: {
    useNewProfile?: boolean
  }
  userRoles: string[]
}

describe('Check if redirect is active', () => {
  let next
  let controller
  describe('when the redirect is active', () => {
    beforeEach(() => {
      next = jest.fn()
      config.app.prisonerProfileRedirect.url = 'http://dummy.com'
      config.app.prisonerProfileRedirect.enabledDate = parseDate('2023-06-06T13:15:00')
      config.app.prisonerProfileRedirect.enabledPrisons = 'LEI'
      controller = useNewProfile()
    })

    it('Then isRedirectActive should return true', async () => {
      const res: Res = { locals: {}, userRoles: ['ROLE_DPS_APPLICATION_DEVELOPER'] }
      const req = { session: { userDetails: { activeCaseLoadId: 'LEI' } }, query: {} }
      await controller(req, res, next)
      expect(res.locals.useNewProfile).toEqual(true)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('when the redirect is not active', () => {
    const req = { session: { userDetails: { activeCaseloadId: '' } }, query: {} }
    beforeEach(() => {
      next = jest.fn()
      controller = useNewProfile()
    })

    it('Then isRedirectActive should return false', async () => {
      const res: Res = { locals: {}, userRoles: [] }
      await controller(req, res, next)
      expect(res.locals.useNewProfile).toEqual(false)
      expect(next).toHaveBeenCalled()
    })
  })
})
