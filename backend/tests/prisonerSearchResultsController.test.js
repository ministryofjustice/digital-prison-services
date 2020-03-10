const prisonerSearchResultsController = require('../controllers/search/prisonerSearchResultsController')
const { serviceUnavailableMessage } = require('../common-messages')

describe('Prisoner search results', () => {
  const elite2Api = {}
  const oauthApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      query: {},
      originalUrl: 'http://localhost',
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()

    oauthApi.userRoles = jest.fn()
    elite2Api.globalSearch = jest.fn()
    elite2Api.getAgencyDetails = jest.fn().mockReturnValue({ description: 'Prison name' })

    controller = prisonerSearchResultsController({ elite2Api, oauthApi, logError })
  })

  describe('loading the page', () => {
    describe('and the user does not have the correct permissions', () => {
      beforeEach(() => {
        oauthApi.userRoles.mockReturnValue([])
      })

      it('should not perform a search and redirect the user', async () => {
        await controller(req, res)

        expect(elite2Api.globalSearch).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('back')
      })
    })

    describe('and the user does have the correct permissions', () => {
      beforeEach(() => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIDEO_LINK_COURT_USER' }])
        elite2Api.globalSearch.mockReturnValue([
          {
            offenderNo: 'G0011GX',
            firstName: 'TEST',
            middleNames: 'ING',
            lastName: 'USER',
            dateOfBirth: '1980-07-17',
            latestLocationId: 'LEI',
            latestLocation: 'Leeds',
            pncNumber: '1/2345',
          },
          {
            offenderNo: 'A0011GZ',
            firstName: 'TEST',
            middleNames: 'ING',
            lastName: 'USER',
            dateOfBirth: '1981-07-17',
            latestLocationId: 'MDI',
            latestLocation: 'Moorlands',
          },
        ])
      })

      describe('when searching with an offenderNo', () => {
        const offenderNo = 'G0011GX'

        it('should make the correct search', async () => {
          req.query = { nameOrNumber: offenderNo }

          await controller(req, res)

          expect(elite2Api.globalSearch).toHaveBeenCalledWith(res.locals, {
            offenderNo,
            firstName: null,
            lastName: null,
            location: 'IN',
          })
        })
      })

      describe('when searching with a name', () => {
        const firstName = 'Test'
        const lastName = 'User'

        it('should make the correct search and return the correct results', async () => {
          req.query = { nameOrNumber: `${lastName}, ${firstName}` }

          await controller(req, res)

          expect(elite2Api.globalSearch).toHaveBeenCalledWith(res.locals, {
            firstName,
            lastName,
            location: 'IN',
          })

          expect(elite2Api.getAgencyDetails).not.toHaveBeenCalled()

          expect(res.render).toHaveBeenCalledWith('prisonerSearchResults.njk', {
            searchString: 'User, Test',
            results: [
              {
                name: 'User, Test',
                offenderNo: 'G0011GX',
                dob: '17/07/1980',
                prison: 'Leeds',
                pncNumber: '1/2345',
                prisonId: 'LEI',
                addAppointmentHTML: '',
              },
              {
                name: 'User, Test',
                offenderNo: 'A0011GZ',
                dob: '17/07/1981',
                prison: 'Moorlands',
                pncNumber: '--',
                prisonId: 'MDI',
                addAppointmentHTML: '',
              },
            ],
            homeUrl: '/videolink',
          })
        })

        describe('and searching with a dob and prison', () => {
          const dob = '1981-07-17'
          const prison = 'MDI'

          it('should make the correct search and return the correct results', async () => {
            req.query = { nameOrNumber: `${lastName}, ${firstName}`, dob, prison }

            await controller(req, res)

            expect(elite2Api.globalSearch).toHaveBeenCalledWith(res.locals, {
              firstName,
              lastName,
              location: 'IN',
              dateOfBirth: dob,
            })

            expect(elite2Api.getAgencyDetails).toHaveBeenCalledWith(res.locals, prison)

            expect(res.render).toHaveBeenCalledWith('prisonerSearchResults.njk', {
              searchString: 'User, Test + 17/07/1981 + Prison name',
              results: [
                {
                  name: 'User, Test',
                  offenderNo: 'A0011GZ',
                  dob: '17/07/1981',
                  prison: 'Moorlands',
                  pncNumber: '--',
                  prisonId: 'MDI',
                  addAppointmentHTML: '',
                },
              ],
              homeUrl: '/videolink',
            })
          })
        })
      })
    })

    describe('when there are API errors', () => {
      it('should render the error template if there is an error retrieving user roles', async () => {
        oauthApi.userRoles.mockImplementation(() => Promise.reject(new Error('Network error')))
        await controller(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/', homeUrl: '/videolink' })
      })

      it('should render the error template if there is an error with global search', async () => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIDEO_LINK_COURT_USER' }])
        elite2Api.globalSearch.mockImplementation(() => Promise.reject(new Error('Network error')))
        await controller(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/', homeUrl: '/videolink' })
      })
    })
  })
})
