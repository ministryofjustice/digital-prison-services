import { get, head } from 'superagent'
import config from '../config'
import changeCaseloadRedirect from './changeCaseloadRedirect'

describe('changeCaseloadRedirect', () => {
  const homepageUrl = 'http://dpshomepage'
  const path = 'some-path'
  const activeCaseLoadId = 'MDI'

  let req
  let res
  let next
  let redirect

  beforeEach(() => {
    config.app.homepageRedirect.url = homepageUrl
    config.app.homepageRedirect.changeCaseloadRedirect.enabledPrisons = 'LEI,MDI'

    next = jest.fn()
    req = { get: jest.fn() }
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
      set: jest.fn(),
    }

    redirect = changeCaseloadRedirect({ path })
  })

  it('Does not redirect the user if they do not have a redirected prison as their active caseload', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/change-caseload',
      session: { userDetails: { activeCaseLoadId: 'KMI' } },
    }
    redirect(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('Redirects the user with any caseload when the wildcard is redirected', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/change-caseload',
      session: { userDetails: { activeCaseLoadId: 'KMI' } },
    }
    config.app.homepageRedirect.changeCaseloadRedirect.enabledPrisons = '***'
    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path')
  })

  it('Redirects the user if they have a redirected prison as their active caseload', () => {
    req = { ...req, url: 'http://localhost:8080/change-caseload', session: { userDetails: { activeCaseLoadId } } }
    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path')
  })

  it('Redirects the user with query params if they have a redirected prison as their active caseload', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/change-caseload?someParam=quimby',
      session: { userDetails: { activeCaseLoadId } },
    }
    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path?someParam=quimby')
  })

  it('Sets the referer header on redirect if present', () => {
    const refererHeader = 'http://something-that-refers.com'
    req = {
      ...req,
      url: '/change-caseload',
      session: { userDetails: { activeCaseLoadId } },
      get: (headerKey: string) => refererHeader,
    }

    redirect(req, res, next)

    expect(res.set).toHaveBeenCalledWith('Referer', refererHeader)
    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path')
  })
})
