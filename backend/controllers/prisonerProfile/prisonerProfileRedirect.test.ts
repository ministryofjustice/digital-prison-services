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
  let redirect

  beforeEach(() => {
    config.app.prisonerProfileRedirect.url = prisonerProfileUrl

    next = jest.fn()
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    }

    req = { params: { offenderNo } }

    redirect = prisonerProfileRedirect({ path })
  })

  it('redirects user with activeCaseload', () => {
    req = { ...req, session: { userDetails: { activeCaseLoadId } } }

    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(`${prisonerProfileUrl}/prisoner/${offenderNo}${path}`)
  })

  it('displays no caseload error page to a prison user', () => {
    req = { ...req, session: { userDetails: { authSource: 'nomis', activeCaseLoadId: null } } }

    redirect(req, res, next)

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/noCaseloads.njk', {
      homepageLinkText: 'DPS homepage',
      homepageUrl: config.app.homepageRedirect.url,
    })
  })

  it('displays no caseload error page to a non-prison user', () => {
    req = { ...req, session: { userDetails: { authSource: 'not-nomis', activeCaseLoadId: null } } }

    redirect(req, res, next)

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/noCaseloads.njk', {
      homepageLinkText: 'HMPPS Digital Services homepage',
      homepageUrl: config.apis.oauth2.url,
    })
  })
})
