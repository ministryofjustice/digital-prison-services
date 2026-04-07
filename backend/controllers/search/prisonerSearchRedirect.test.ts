import config from '../../config'
import { prisonerSearchGetRedirect } from './prisonerSearchRedirect'

describe('prisonerSearchRedirect', () => {
  const homepageUrl = 'http://dpshomepage'

  let req
  let res

  beforeEach(() => {
    config.app.homepageRedirect.url = homepageUrl
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    }
  })

  it('Redirects the user with any caseload', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/prisoner-search',
      session: { userDetails: { activeCaseLoadId: 'ABC' } },
    }
    prisonerSearchGetRedirect(req, res)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/prisoner-search')
  })

  it('Redirects the user with any caseload and keeps query params', () => {
    req = {
      ...req,
      url: 'http://localhost:8080/prisoner-search?searchText=quimby',
      session: { userDetails: { activeCaseLoadId: 'ABC' } },
    }
    prisonerSearchGetRedirect(req, res)

    expect(res.redirect).toHaveBeenCalledWith('http://dpshomepage/prisoner-search?searchText=quimby')
  })
})
