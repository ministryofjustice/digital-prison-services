import config from '../../config'
import globalSearchRedirect from './globalSearchRedirect'

describe('globalSearchRedirect', () => {
  const homepageUrl = 'http://dpshomepage'
  const path = 'some-path'

  let req
  let res
  let next
  let redirect

  beforeEach(() => {
    config.app.homepageRedirect.url = homepageUrl

    next = jest.fn()
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    }

    redirect = globalSearchRedirect({ path })
  })

  it('Does not redirect for users without a caseload (probation)', () => {
    req = { ...req, url: 'http://localhost:8080/globalSearch', session: { userDetails: {} } }
    redirect(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('Redirects the user with any caseload', () => {
    req = { ...req, url: 'http://localhost:8080/globalSearch', session: { userDetails: { activeCaseLoadId: 'ABC' } } }
    redirect(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path')
  })

  it('Redirects the user with any caseload and keeps query params', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/globalSearch?searchText=quimby',
      session: { userDetails: { activeCaseLoadId: 'ABC' } },
    }
    redirect(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path?searchText=quimby')
  })
})
