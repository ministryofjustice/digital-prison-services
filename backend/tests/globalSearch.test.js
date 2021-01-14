const globalSearchController = require('../controllers/globalSearch')

describe('Global search', () => {
  const offenderSearchApi = {}
  const oauthApi = {}
  const paginationService = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
      baseUrl: '/global-search',
      originalUrl: '/global-search',
      query: {},
    }
    res = {
      locals: {
        user: { activeCaseLoad: { caseLoadId: 'MDI' } },
        responseHeaders: {
          'total-records': 0,
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
    }

    logError = jest.fn()

    offenderSearchApi.globalSearch = jest.fn()

    oauthApi.userRoles = jest.fn().mockResolvedValue([])

    paginationService.getPagination = jest.fn()

    controller = globalSearchController({ paginationService, offenderSearchApi, oauthApi, logError })
  })

  describe('indexPage', () => {
    it('Should render the correct template and values', async () => {
      await controller.indexPage(req, res)

      expect(res.render).toHaveBeenCalledWith('globalSearch/globalSearch.njk', {
        backLink: undefined,
        dpsUrl: 'http://localhost:3000/',
        referrer: undefined,
      })
    })

    describe('when there is a valid referrer value', () => {
      it('Should render the correct template and values', async () => {
        req.query.referrer = 'licences'
        await controller.indexPage(req, res)

        expect(res.render).toHaveBeenCalledWith('globalSearch/globalSearch.njk', {
          backLink: 'http://localhost:3003/',
          dpsUrl: 'http://localhost:3000/',
          referrer: 'licences',
        })
      })
    })
  })

  describe('resultsPage', () => {
    const defaultContext = {
      requestHeaders: { 'page-limit': 20, 'page-offset': 0 },
      responseHeaders: { 'total-records': 0 },
      user: { activeCaseLoad: { caseLoadId: 'MDI' } },
    }

    describe('when there is no search text', () => {
      it('should not call offender search api', async () => {
        await controller.resultsPage(req, res)

        expect(offenderSearchApi.globalSearch).not.toHaveBeenCalled()
      })

      it('should still render the correct template', async () => {
        await controller.resultsPage(req, res)

        expect(res.render).toHaveBeenCalledWith('globalSearch/globalSearchResults.njk', {
          backLink: undefined,
          dpsUrl: 'http://localhost:3000/',
          errors: [],
          formValues: {
            filters: {},
            searchText: undefined,
          },
          isLicencesUser: false,
          openFilters: false,
          pagination: undefined,
          referrer: undefined,
          results: [],
        })
      })
    })

    describe('when there is search text with a prisoner name', () => {
      it('should make the correct call using the prisoner name', async () => {
        req.query = {
          searchText: 'Smith Ben',
          locationFilter: 'ALL',
          genderFilter: 'ALL',
        }

        await controller.resultsPage(req, res)

        expect(offenderSearchApi.globalSearch).toHaveBeenCalledWith(
          defaultContext,
          {
            dateOfBirth: undefined,
            firstName: 'Ben',
            gender: 'ALL',
            includeAliases: true,
            lastName: 'Smith',
            location: 'ALL',
          },
          20
        )
      })

      it('should make the correct call from a comma separated name', async () => {
        req.query = {
          searchText: 'Smith, Ben',
          locationFilter: 'ALL',
          genderFilter: 'ALL',
        }

        await controller.resultsPage(req, res)

        expect(offenderSearchApi.globalSearch).toHaveBeenCalledWith(
          defaultContext,
          {
            dateOfBirth: undefined,
            firstName: 'Ben',
            gender: 'ALL',
            includeAliases: true,
            lastName: 'Smith',
            location: 'ALL',
          },
          20
        )
      })
    })

    describe('when there is search text with a prisoner number', () => {
      it('should make the correct call with prisonerIdentifier', async () => {
        req.query = {
          searchText: 'abc123',
          locationFilter: 'ALL',
          genderFilter: 'ALL',
        }

        await controller.resultsPage(req, res)

        expect(offenderSearchApi.globalSearch).toHaveBeenCalledWith(
          defaultContext,
          {
            dateOfBirth: undefined,
            gender: 'ALL',
            includeAliases: true,
            prisonerIdentifier: 'ABC123',
            location: 'ALL',
          },
          20
        )
      })
    })

    describe('when there is search text and a valid date of birth', () => {
      it('should make the correct call', async () => {
        req.query = {
          searchText: 'ABC123',
          locationFilter: 'ALL',
          genderFilter: 'ALL',
          dobDay: 7,
          dobMonth: 4,
          dobYear: 1958,
        }

        await controller.resultsPage(req, res)

        expect(offenderSearchApi.globalSearch).toHaveBeenCalledWith(
          defaultContext,
          {
            dateOfBirth: '1958-04-07',
            gender: 'ALL',
            includeAliases: true,
            prisonerIdentifier: 'ABC123',
            location: 'ALL',
          },
          20
        )
      })
    })

    describe('when there is data', () => {
      beforeEach(() => {
        offenderSearchApi.globalSearch.mockResolvedValue([
          {
            offenderNo: 'A1234AC',
            firstName: 'FRED',
            lastName: 'QUIMBY',
            latestLocation: 'Leeds HMP',
            latestLocationId: 'LEI',
            dateOfBirth: '1977-10-15',
            locationDescription: 'Leeds HMP',
            currentlyInPrison: 'Y',
            latestBookingId: 1,
            currentWorkingFirstName: 'FREDERICK',
            currentWorkingLastName: 'QUIMBYS',
          },
          {
            offenderNo: 'A1234AA',
            firstName: 'ARTHUR',
            lastName: 'ANDERSON',
            latestLocationId: 'MDI',
            latestLocation: 'Moorland HMP',
            dateOfBirth: '1976-09-15',
            locationDescription: 'Moorland HMP',
            currentlyInPrison: 'N',
            latestBookingId: 2,
            currentWorkingFirstName: 'ARTHURS',
            currentWorkingLastName: 'ANDERSONS',
          },
        ])
      })

      it('should render the correct template with the correct values', async () => {
        req.query = {
          searchText: 'Smith Ben',
          locationFilter: 'ALL',
          genderFilter: 'ALL',
        }

        await controller.resultsPage(req, res)

        expect(res.render).toHaveBeenCalledWith('globalSearch/globalSearchResults.njk', {
          backLink: undefined,
          dpsUrl: 'http://localhost:3000/',
          errors: [],
          formValues: {
            filters: {
              genderFilter: 'ALL',
              locationFilter: 'ALL',
            },
            searchText: 'Smith Ben',
          },
          isLicencesUser: false,
          openFilters: false,
          pagination: undefined,
          referrer: undefined,
          results: [
            {
              dateOfBirth: '15/10/1977',
              firstName: 'FRED',
              lastName: 'QUIMBY',
              currentWorkingFirstName: 'FREDERICK',
              currentWorkingLastName: 'QUIMBYS',
              latestBookingId: 1,
              latestLocation: 'Leeds HMP',
              latestLocationId: 'LEI',
              locationDescription: 'Leeds HMP',
              name: 'Quimby, Fred',
              offenderNo: 'A1234AC',
              showProfileLink: true,
              showUpdateLicenceLink: false,
              updateLicenceLink: 'http://localhost:3003/hdc/taskList/1',
              workingName: 'Quimbys, Frederick',
              currentlyInPrison: 'Y',
            },
            {
              dateOfBirth: '15/09/1976',
              firstName: 'ARTHUR',
              lastName: 'ANDERSON',
              currentWorkingFirstName: 'ARTHURS',
              currentWorkingLastName: 'ANDERSONS',
              latestBookingId: 2,
              latestLocation: 'Moorland HMP',
              latestLocationId: 'MDI',
              locationDescription: 'Moorland HMP',
              name: 'Anderson, Arthur',
              offenderNo: 'A1234AA',
              showProfileLink: false,
              showUpdateLicenceLink: false,
              updateLicenceLink: 'http://localhost:3003/hdc/taskList/2',
              workingName: 'Andersons, Arthurs',
              currentlyInPrison: 'N',
            },
          ],
        })
      })

      it('should call the pagination service', async () => {
        req.query = {
          searchText: 'Smith Ben',
          locationFilter: 'ALL',
          genderFilter: 'ALL',
        }
        res.locals.responseHeaders['total-records'] = 5

        await controller.resultsPage(req, res)

        expect(paginationService.getPagination).toHaveBeenCalledWith(
          5,
          0,
          20,
          new URL('http://localhost/global-search')
        )
      })

      describe('when there are non default filter values', () => {
        it('should let the template know the open the filters section', async () => {
          req.query = {
            searchText: 'ABC123',
            locationFilter: 'ALL',
            genderFilter: 'M',
            dobDay: 7,
            dobMonth: 4,
            dobYear: 1958,
          }

          await controller.resultsPage(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'globalSearch/globalSearchResults.njk',
            expect.objectContaining({
              formValues: {
                filters: {
                  dobDay: 7,
                  dobMonth: 4,
                  dobYear: 1958,
                  genderFilter: 'M',
                  locationFilter: 'ALL',
                },
                searchText: 'ABC123',
              },
              openFilters: true,
            })
          )
        })
      })

      describe('should run dob validation', () => {
        it('should trigger date of birth in the past validation message', async () => {
          req.query = {
            searchText: 'ABC123',
            dobDay: 1,
            dobMonth: 1,
            dobYear: 8000,
          }

          await controller.resultsPage(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'globalSearch/globalSearchResults.njk',
            expect.objectContaining({
              errors: [{ href: '#dobDay', text: 'Enter a date of birth which is in the past' }, { href: '#dobError' }],
            })
          )
        })

        it('should trigger date of birth not real validation message', async () => {
          req.query = {
            searchText: 'ABC123',
            dobDay: 200,
            dobMonth: 200,
            dobYear: 8000,
          }

          await controller.resultsPage(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'globalSearch/globalSearchResults.njk',
            expect.objectContaining({
              errors: [{ href: '#dobDay', text: 'Enter a date of birth which is a real date' }, { href: '#dobError' }],
            })
          )
        })
      })

      describe('when viewed by a licenses user', () => {
        beforeEach(() => {
          req.query = {
            referrer: 'licences',
            searchText: 'ABC123',
            locationFilter: 'ALL',
            genderFilter: 'ALL',
          }

          oauthApi.userRoles.mockResolvedValue([{ roleCode: 'LICENCE_RO' }])
        })

        it('should have let the template know which licence related content to show', async () => {
          await controller.resultsPage(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'globalSearch/globalSearchResults.njk',
            expect.objectContaining({
              backLink: 'http://localhost:3003/',
              isLicencesUser: true,
              referrer: 'licences',
              results: [
                expect.objectContaining({
                  currentlyInPrison: 'Y',
                  name: 'Quimby, Fred',
                  offenderNo: 'A1234AC',
                  showProfileLink: true,
                  showUpdateLicenceLink: true,
                  updateLicenceLink: 'http://localhost:3003/hdc/taskList/1',
                }),
                expect.objectContaining({
                  currentlyInPrison: 'N',
                  name: 'Anderson, Arthur',
                  offenderNo: 'A1234AA',
                  showProfileLink: false,
                  showUpdateLicenceLink: false,
                  updateLicenceLink: 'http://localhost:3003/hdc/taskList/2',
                }),
              ],
            })
          )
        })

        describe('and a licences vary user', () => {
          beforeEach(() => {
            oauthApi.userRoles.mockResolvedValue([{ roleCode: 'LICENCE_RO' }, { roleCode: 'LICENCE_VARY' }])
          })

          it('should have let the template know which licence related content to show', async () => {
            await controller.resultsPage(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'globalSearch/globalSearchResults.njk',
              expect.objectContaining({
                backLink: 'http://localhost:3003/',
                isLicencesUser: true,
                referrer: 'licences',
                results: [
                  expect.objectContaining({
                    currentlyInPrison: 'Y',
                    name: 'Quimby, Fred',
                    offenderNo: 'A1234AC',
                    showProfileLink: true,
                    showUpdateLicenceLink: true,
                    updateLicenceLink: 'http://localhost:3003/hdc/taskList/1',
                  }),
                  expect.objectContaining({
                    currentlyInPrison: 'N',
                    name: 'Anderson, Arthur',
                    offenderNo: 'A1234AA',
                    showProfileLink: false,
                    showUpdateLicenceLink: true,
                    updateLicenceLink: 'http://localhost:3003/hdc/taskList/2',
                  }),
                ],
              })
            )
          })
        })
      })

      describe('when viewed by a user which can view inactive bookings', () => {
        beforeEach(() => {
          req.query = {
            searchText: 'ABC123',
            locationFilter: 'ALL',
            genderFilter: 'ALL',
          }
          oauthApi.userRoles.mockResolvedValue([{ roleCode: 'INACTIVE_BOOKINGS' }])
        })

        it('should have let the template know to still link to former prisoner profiles', async () => {
          await controller.resultsPage(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'globalSearch/globalSearchResults.njk',
            expect.objectContaining({
              isLicencesUser: false,
              results: [
                expect.objectContaining({
                  currentlyInPrison: 'Y',
                  name: 'Quimby, Fred',
                  offenderNo: 'A1234AC',
                  showProfileLink: true,
                }),
                expect.objectContaining({
                  currentlyInPrison: 'N',
                  name: 'Anderson, Arthur',
                  offenderNo: 'A1234AA',
                  showProfileLink: true,
                }),
              ],
            })
          )
        })
      })
    })
  })
})
