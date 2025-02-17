import prisonerProfileRedirect from './prisonerProfileRedirect'
import config from '../../config'

describe('prisoner profile redirect', () => {
  const prisonerProfileUrl = 'http://prisonerprofile'
  const path = '/some-path'
  const offenderNo = 'A1234AA'
  const activeCaseLoadId = 'MDI'

  let req
  let res
  let next
  let handler
  let redirect

  beforeEach(() => {
    config.app.prisonerProfileRedirect.url = prisonerProfileUrl

    next = jest.fn()
    handler = jest.fn()
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    }

    req = { params: { offenderNo } }

    redirect = prisonerProfileRedirect({ path, handler })
  })

  describe('when no inaccessible date is set', () => {
    beforeAll(() => {
      config.app.prisonerProfileRedirect.oldPrisonerProfileInaccessibleFrom = null
    })

    it('redirects user with activeCaseload', () => {
      req = { ...req, session: { userDetails: { activeCaseLoadId } } }

      redirect(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`${prisonerProfileUrl}/prisoner/${offenderNo}${path}`)
    })

    it('allows users with no caseload to access the profile', () => {
      req = { ...req, session: { userDetails: { activeCaseLoadId: null } } }

      redirect(req, res, next)

      expect(handler).toHaveBeenCalledWith(req, res, next)
    })
  })

  describe('when future inaccessible date is set', () => {
    beforeAll(() => {
      config.app.prisonerProfileRedirect.oldPrisonerProfileInaccessibleFrom = Date.now() + 1000
    })

    it('redirects user with activeCaseload', () => {
      req = { ...req, session: { userDetails: { activeCaseLoadId } } }

      redirect(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`${prisonerProfileUrl}/prisoner/${offenderNo}${path}`)
    })

    it('allows users with no caseload to access the profile', () => {
      req = { ...req, session: { userDetails: { activeCaseLoadId: null } } }

      redirect(req, res, next)

      expect(handler).toHaveBeenCalledWith(req, res, next)
    })
  })

  describe('when inaccessible date has passed', () => {
    beforeAll(() => {
      config.app.prisonerProfileRedirect.oldPrisonerProfileInaccessibleFrom = Date.now() - 1000
    })

    it('redirects user with activeCaseload', () => {
      req = { ...req, session: { userDetails: { activeCaseLoadId } } }

      redirect(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`${prisonerProfileUrl}/prisoner/${offenderNo}${path}`)
    })

    it('displays no caseload error page to the user', () => {
      req = { ...req, session: { userDetails: { activeCaseLoadId: null } } }

      redirect(req, res, next)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/noCaseloads.njk')
    })
  })
})
