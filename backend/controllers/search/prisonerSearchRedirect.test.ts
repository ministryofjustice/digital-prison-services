import config from '../../config'
import prisonerSearchRedirect from './prisonerSearchRedirect'

describe('prisonerSearchRedirect', () => {
  const homepageUrl = 'http://dpshomepage'

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

    redirect = prisonerSearchRedirect()
  })

  it('Redirects the user with any caseload', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/prisoner-search',
      session: { userDetails: { activeCaseLoadId: 'ABC' } },
    }
    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/prisoner-search')
  })

  it('Redirects the user with any caseload and keeps query params', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/prisoner-search?searchText=quimby',
      session: { userDetails: { activeCaseLoadId: 'ABC' } },
    }
    redirect(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/prisoner-search?searchText=quimby')
  })
})
