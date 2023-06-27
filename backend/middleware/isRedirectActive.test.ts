import isRedirectActive from './isRedirectActive'
import config, { parseDate } from '../config'

describe('Check if redirect is active', () => {
  let next
  let controller
  describe.skip('when the redirect is active', () => {
    beforeEach(() => {
      next = jest.fn()
      config.app.prisonerProfileRedirect.enabledDate = parseDate('2023-06-06T13:15:00')
      config.app.prisonerProfileRedirect.enabledPrisons = 'LEI'
      controller = isRedirectActive()
    })

    it('Then isRedirectActive should return true', async () => {
      const res = { locals: { isRedirectActive: true }, userRoles: ['ROLE_DPS_APPLICATION_DEVELOPERx'] }
      const req = { session: { userDetails: { activeCaseloadId: 'LEI' } }, query: {} }
      res.locals.isRedirectActive = true
      await controller(req, res, next)
      expect(res.locals.isRedirectActive).toEqual({})
      expect(next).toHaveBeenCalled()
    })
  })

  describe('when the redirect is not active', () => {
    const req = { session: { userDetails: { activeCaseloadId: '' } }, query: {} }
    beforeEach(() => {
      next = jest.fn()
      controller = isRedirectActive()
    })

    it('Then isRedirectActive should return false', async () => {
      const res = { locals: { isRedirectActive: false } }
      res.locals.isRedirectActive = false
      await controller(req, res, next)
      expect(res.locals.isRedirectActive).toEqual(false)
      expect(next).toHaveBeenCalled()
    })
  })
})
