import { probationDocumentsFactory } from '../controllers/probationDocuments'
import { Conviction } from '../api/deliusIntegrationApi'

function aDocument(overrides = {}) {
  return {
    id: '1e593ff6-d5d6-4048-a671-cdeb8f65608b',
    name: 'PRE-CONS.pdf',
    author: 'Andy Marke',
    type: 'PNC previous convictions',
    description: 'Previous convictions as of 01/09/2019',
    createdAt: '2019-09-10T00:00:00',
    ...overrides,
  }
}

function aConviction(overrides: Partial<Conviction> = {}): Conviction {
  return {
    active: true,
    date: new Date(Date.parse('2018-09-04')),
    offence: 'Murder of infants under 1 year of age',
    title: 'CJA - Indeterminate Public Prot. (5 Years)',
    institutionName: 'Berwyn (HMP)',
    documents: [],
    ...overrides,
  }
}

function documentsWithSingleConvictionMatching(conviction) {
  return expect.objectContaining({
    documents: {
      offenderDocuments: [],
      convictions: expect.objectContaining([expect.objectContaining(conviction)]),
    },
  })
}

function documentsWithMultipleConvictionMatching(convictions) {
  return expect.objectContaining({
    documents: {
      offenderDocuments: [],
      convictions: expect.objectContaining(convictions.map((conviction) => expect.objectContaining(conviction))),
    },
  })
}

function error(message, status) {
  const theError = new Error(message) as any
  theError.status = status
  return theError
}

describe('Probation documents', () => {
  const oauthApi = {
    userRoles: jest.fn(),
  }
  const hmppsManageUsersApi = {
    currentUser: jest.fn(),
  }
  const prisonApi = {
    getDetails: jest.fn(),
    userCaseLoads: jest.fn(),
  }
  const deliusIntegrationApi = {
    getProbationDocuments: jest.fn(),
  }
  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }
  const getDetailsResponse = { agencyId: 'LEI', bookingId: 1234, firstName: 'Test', lastName: 'User' }

  describe('Controller', () => {
    const mockReq = { flash: jest.fn().mockReturnValue([]), originalUrl: '/offenders/G9542VP/probation-documents' }
    beforeEach(() => {
      prisonApi.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
      prisonApi.userCaseLoads = jest.fn()
      hmppsManageUsersApi.currentUser = jest.fn()
      oauthApi.userRoles = jest.fn()
      deliusIntegrationApi.getProbationDocuments = jest.fn()
      systemOauthClient.getClientCredentialsTokens = jest.fn()
      systemOauthClient.getClientCredentialsTokens.mockReturnValue({})
      hmppsManageUsersApi.currentUser.mockReturnValue({
        username: 'USER_ADM',
        active: true,
        name: 'User Name',
        activeCaseLoadId: 'LEI',
      })
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
      prisonApi.userCaseLoads.mockReturnValue([
        {
          currentlyActive: true,
          caseLoadId: 'LEI',
          description: 'Description',
        },
      ])
    })

    describe('when rendering page', () => {
      const res = {
        render: jest.fn(),
      }
      let req
      let page

      beforeEach(() => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          name: {
            crn: 'X123456',
            firstName: 'John',
            surname: 'Smith',
          },
          documents: [],
          convictions: [],
        })
        page = probationDocumentsFactory(
          oauthApi,
          hmppsManageUsersApi,
          prisonApi,
          deliusIntegrationApi,
          systemOauthClient
        ).displayProbationDocumentsPage
        res.render = jest.fn()

        req = { ...mockReq, params: { offenderNo: 'G9542VP' } }
      })

      it('should render the probation documents page with title', async () => {
        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            title: 'Probation documents - Digital Prison Services',
          })
        )
      })

      it('should render the probation documents page with no errors', async () => {
        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            errors: [],
          })
        )
      })

      it('should supply page with user and caseload', async () => {
        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            offenderDetails: {
              bookingId: 1234,
              name: 'User, Test',
              offenderNo: 'G9542VP',
              profileUrl: '/prisoner/G9542VP',
            },
            user: {
              activeCaseLoad: {
                description: 'Description',
                id: 'LEI',
              },
              displayName: 'User Name',
            },
          })
        )
      })

      it('should supply page with offender related document', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          documents: [aDocument({ id: '1' }), aDocument({ id: '2' })],
          convictions: [],
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [expect.objectContaining({ id: '1' }), expect.objectContaining({ id: '2' })],
              convictions: [],
            },
          })
        )
      })

      it('should supply page with mapped offender related document', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          documents: [
            aDocument({
              name: 'PRE-CONS.pdf',
              author: 'Kate Bracket',
              type: 'PNC previous convictions',
              description: 'Previous convictions as of 01/09/2019',
              createdAt: '2019-09-10T00:00:00',
            }),
          ],
          convictions: [],
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [
                {
                  author: 'Kate Bracket',
                  createdAt: '2019-09-10T00:00:00',
                  description: 'Previous convictions as of 01/09/2019',
                  name: 'PRE-CONS.pdf',
                  id: '1e593ff6-d5d6-4048-a671-cdeb8f65608b',
                  type: 'PNC previous convictions',
                },
              ],
              convictions: [],
            },
          })
        )
      })
      it('should allow page to be displayed when no documents at all', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          documents: [],
          convictions: [],
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [],
              convictions: [],
            },
          })
        )
      })

      it('should allow page to be displayed when no documents but with convictions', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({ documents: [], convictions: [aConviction()] })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [],
              convictions: expect.objectContaining([
                expect.objectContaining({
                  documents: [],
                }),
              ]),
            },
          })
        )
      })

      it('should supply page with conviction related document', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          documents: [],
          convictions: [
            { documents: [aDocument({ id: '1' }), aDocument({ id: '2' })] },
            { documents: [aDocument({ id: '3' }), aDocument({ id: '4' })] },
          ],
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [],
              convictions: expect.objectContaining([
                expect.objectContaining({
                  documents: [expect.objectContaining({ id: '1' }), expect.objectContaining({ id: '2' })],
                }),
                expect.objectContaining({
                  documents: [expect.objectContaining({ id: '3' }), expect.objectContaining({ id: '4' })],
                }),
              ]),
            },
          })
        )
      })

      it('should supply page with mapped document for conviction', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          documents: [],
          convictions: [
            {
              documents: [
                aDocument({
                  name: 'PRE-CONS.pdf',
                  author: 'Kate Bracket',
                  type: 'PNC previous convictions',
                  description: 'Previous convictions as of 01/09/2019',
                  createdAt: '2019-09-10T00:00:00',
                }),
              ],
            },
          ],
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [],
              convictions: expect.objectContaining([
                expect.objectContaining({
                  documents: [
                    {
                      author: 'Kate Bracket',
                      createdAt: '2019-09-10T00:00:00',
                      description: 'Previous convictions as of 01/09/2019',
                      name: 'PRE-CONS.pdf',
                      id: '1e593ff6-d5d6-4048-a671-cdeb8f65608b',
                      type: 'PNC previous convictions',
                    },
                  ],
                }),
              ]),
            },
          })
        )
      })

      it('should supply page with each conviction', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          convictions: [aConviction({ active: true }), aConviction({ active: false })],
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithMultipleConvictionMatching([{ active: true }, { active: false }])
        )
      })

      it('should use main offence for conviction', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          convictions: [aConviction({ offence: 'Treason' })],
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ offence: 'Treason' })
        )
      })

      it('should supply institution name when in custody', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          convictions: [aConviction({ institutionName: 'Berwyn (HMP)' })],
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ institutionName: 'Berwyn (HMP)' })
        )
      })

      it('should supply offender details from probation', async () => {
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({
          crn: 'X123456',
          name: {
            forename: 'John',
            surname: 'Smith',
          },
        })

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            probationDetails: {
              name: 'John Smith',
              crn: 'X123456',
            },
          })
        )
      })

      it('should pass system credentials from auth call to convictions API ', async () => {
        systemOauthClient.getClientCredentialsTokens.mockReturnValue({ token: 'ABC' })
        await page(req, res)

        expect(deliusIntegrationApi.getProbationDocuments).toHaveBeenCalledWith(
          { token: 'ABC' },
          { offenderNo: 'G9542VP' }
        )
      })
      describe('access to the page based on role and caseload', () => {
        it('should not allow access to page if user does not have role', async () => {
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOME_OTHER_ROLE' }])
          await page(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'probationDocuments.njk',
            expect.objectContaining({
              errors: [
                {
                  text: 'Sorry, the service is unavailable',
                },
              ],
            })
          )
        })

        it('should not allow access to page if user does not have the correct caseload', async () => {
          prisonApi.getDetails = jest.fn().mockReturnValue({ ...getDetailsResponse, agencyId: 'MDI' })
          prisonApi.userCaseLoads.mockResolvedValue([
            { caseLoadId: 'BXI', currentlyActive: true },
            { caseLoadId: 'WWI' },
          ])
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })

          await page(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'probationDocuments.njk',
            expect.objectContaining({
              errors: [
                {
                  text: 'Sorry, the service is unavailable',
                },
              ],
            })
          )
        })
        it('should not allow access to page if prisoner is no longer in prison', async () => {
          prisonApi.getDetails = jest.fn().mockReturnValue({ ...getDetailsResponse, agencyId: 'OUT' })
          prisonApi.userCaseLoads.mockResolvedValue([
            { caseLoadId: 'BXI', currentlyActive: true },
            { caseLoadId: 'WWI' },
          ])
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })

          await page(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'probationDocuments.njk',
            expect.objectContaining({
              errors: [
                {
                  text: 'Sorry, the service is unavailable',
                },
              ],
            })
          )
        })

        it('should allow access to page if user has the correct role and in your active caseload', async () => {
          prisonApi.getDetails = jest.fn().mockReturnValue({ ...getDetailsResponse, agencyId: 'BXI' })
          prisonApi.userCaseLoads.mockResolvedValue([
            { caseLoadId: 'BXI', currentlyActive: true },
            { caseLoadId: 'WWI' },
          ])
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })

          await page(req, res)
          expect(res.render).toHaveBeenCalledWith(
            'probationDocuments.njk',
            expect.objectContaining({
              errors: [],
            })
          )
        })

        it('should allow access to page if user has the correct role and is in one of your other caseloads', async () => {
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
          prisonApi.getDetails = jest.fn().mockReturnValue({ ...getDetailsResponse, agencyId: 'WWI' })
          prisonApi.userCaseLoads.mockResolvedValue([
            { caseLoadId: 'BXI', currentlyActive: true },
            { caseLoadId: 'WWI' },
          ])
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })

          await page(req, res)
          expect(res.render).toHaveBeenCalledWith(
            'probationDocuments.njk',
            expect.objectContaining({
              errors: [],
            })
          )
        })
      })
    })
    describe('when rendering page with errors', () => {
      const res = {
        render: jest.fn(),
      }
      let req
      let page

      beforeEach(() => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
        deliusIntegrationApi.getProbationDocuments.mockReturnValue({})
        page = probationDocumentsFactory(
          oauthApi,
          hmppsManageUsersApi,
          prisonApi,
          deliusIntegrationApi,
          systemOauthClient
        ).displayProbationDocumentsPage
        res.render = jest.fn()

        req = { ...mockReq, params: { offenderNo: 'G9542VP' } }
      })

      describe('when offender not found in probation', () => {
        beforeEach(() => {
          deliusIntegrationApi.getProbationDocuments.mockRejectedValue(error('Not found', 404))
        })
        it('should render page with offender not found message', async () => {
          await page(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'probationDocuments.njk',
            expect.objectContaining({
              errors: [
                {
                  text: 'We are unable to display documents for this prisoner because we cannot find the offender record in the probation system',
                },
              ],
            })
          )
        })
      })
      describe('when offender find results in error', () => {
        beforeEach(() => {
          deliusIntegrationApi.getProbationDocuments.mockRejectedValue(error('Server error', 503))
        })
        it('should render page with system error message', async () => {
          await page(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'probationDocuments.njk',
            expect.objectContaining({
              errors: [
                {
                  text: 'Sorry, the service is unavailable',
                },
              ],
            })
          )
        })
      })
    })
  })
})
