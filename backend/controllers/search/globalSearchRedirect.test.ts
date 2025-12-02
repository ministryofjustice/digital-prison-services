import config from '../../config'
import globalSearchRedirect from './globalSearchRedirect'

describe('globalSearchRedirect', () => {
  const homepageUrl = 'http://dpshomepage/'
  const path = 'some-path'
  const activeCaseLoadId = 'MDI'

  let req
  let res
  let next
  let redirect

  beforeEach(() => {
    config.app.homepageRedirect.url = homepageUrl
    config.app.homepageRedirect.searchRedirect.enabledPrisons = 'LEI,MDI'

    next = jest.fn()
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    }

    redirect = globalSearchRedirect({ path })
  })

  it('Does not redirect the user if they do not have a redirected prison as their active caseload', () => {
    req = { ...req, url: 'http://localhost:8080/globalSearch', session: { userDetails: { activeCaseLoadId: 'KMI' } } }
    redirect(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('Redirects the user with any caseload when the wildcard is redirected', () => {
    req = { ...req, url: 'http://localhost:8080/globalSearch', session: { userDetails: { activeCaseLoadId: 'KMI' } } }
    config.app.homepageRedirect.searchRedirect.enabledPrisons = '***'
    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path')
  })

  it('Redirects the user if they have a redirected prison as their active caseload', () => {
    req = { ...req, url: 'http://localhost:8080/globalSearch', session: { userDetails: { activeCaseLoadId } } }
    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path')
  })

  it('Redirects the user with query params if they have a redirected prison as their active caseload', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/globalSearch?searchText=quimby',
      session: { userDetails: { activeCaseLoadId } },
    }
    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/some-path?searchText=quimby')
  })
})
