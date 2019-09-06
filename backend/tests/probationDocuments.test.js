import { probationDocumentsFactory } from '../controllers/probationDocuments'

function aConviction(overrides = {}) {
  return Object.assign(
    {
      convictionId: 2500295345,
      index: '1',
      active: true,
      inBreach: false,
      convictionDate: '2019-09-03',
      referralDate: '2018-09-04',
      offences: [
        {
          offenceId: 'M2500295343',
          mainOffence: true,
          detail: {
            code: '00102',
            description: 'Murder (incl abroad) of infants under 1 year of age - 00102',
            mainCategoryCode: '001',
            mainCategoryDescription: 'Murder',
            mainCategoryAbbreviation: 'Murder',
            ogrsOffenceCategory: 'Violence',
            subCategoryCode: '02',
            subCategoryDescription: 'Murder of infants under 1 year of age',
            form20Code: '20',
          },
          offenceDate: '2018-08-04T00:00:00',
          offenceCount: 1,
          offenderId: 2500343964,
          createdDatetime: '2019-09-04T12:13:48',
          lastUpdatedDatetime: '2019-09-04T12:13:48',
        },
        {
          offenceId: 'A2500108084',
          mainOffence: false,
          detail: {
            code: '02801',
            description:
              'Burglary (dwelling) with intent to commit, or the commission of an offence triable only on indictment - 02801',
            mainCategoryCode: '028',
            mainCategoryDescription: 'Burglary in a dwelling',
            mainCategoryAbbreviation: 'Burglary in a dwelling',
            ogrsOffenceCategory: 'Burglary (Domestic)',
            subCategoryCode: '01',
            subCategoryDescription:
              'Burglary (dwelling) with intent to commit, or the commission of, an offence triable only on indictment',
            form20Code: '40',
          },
          offenceDate: '2019-09-02T00:00:00',
          offenceCount: 3,
          createdDatetime: '2019-09-04T12:23:01',
          lastUpdatedDatetime: '2019-09-04T12:23:01',
        },
      ],
      sentence: {
        description: 'CJA - Indeterminate Public Prot.',
        originalLength: 5,
        originalLengthUnits: 'Years',
        secondLength: 5,
        secondLengthUnits: 'Years',
        defaultLength: 60,
        lengthInDays: 1826,
      },
      latestCourtAppearanceOutcome: {
        code: '303',
        description: 'CJA - Indeterminate Public Prot.',
      },
      custody: {
        bookingNumber: 'V74111',
        institution: {
          institutionId: 2500004521,
          isEstablishment: true,
          code: 'BWIHMP',
          description: 'Berwyn (HMP)',
          institutionName: 'Berwyn (HMP)',
        },
      },
    },
    overrides
  )
}

function documentsWithSingleConvictionMatching(conviction) {
  return expect.objectContaining({
    documents: {
      convictions: expect.objectContaining([expect.objectContaining(conviction)]),
    },
  })
}

function documentsWithMultipleConvictionMatching(convictions) {
  return expect.objectContaining({
    documents: {
      convictions: expect.objectContaining(convictions.map(conviction => expect.objectContaining(conviction))),
    },
  })
}

describe('Probation documents', () => {
  const oauthApi = {}
  const elite2Api = {}
  const communityApi = {}
  const systemOauthClient = {}
  const getDetailsResponse = { bookingId: 1234, firstName: 'Test', lastName: 'User' }

  describe('Controller', () => {
    const mockReq = { flash: jest.fn().mockReturnValue([]), originalUrl: '/offenders/G9542VP/probation-documents' }
    beforeEach(() => {
      elite2Api.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
      elite2Api.userCaseLoads = jest.fn()
      oauthApi.currentUser = jest.fn()
      oauthApi.userRoles = jest.fn()
      communityApi.getOffenderConvictions = jest.fn()
      communityApi.getOffenderDetails = jest.fn()
      systemOauthClient.getClientCredentialsTokens = jest.fn()

      systemOauthClient.getClientCredentialsTokens.mockReturnValue({})
    })

    describe('when rendering page', () => {
      const res = {}
      let req
      let page

      beforeEach(() => {
        oauthApi.currentUser.mockReturnValue({
          username: 'USER_ADM',
          active: true,
          name: 'User Name',
          activeCaseLoadId: 'LEI',
        })
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'OMIC_ADMIN' }])
        elite2Api.userCaseLoads.mockReturnValue([
          {
            currentlyActive: true,
            caseLoadId: 'LEI',
            description: 'Description',
          },
        ])
        communityApi.getOffenderConvictions.mockReturnValue([])
        communityApi.getOffenderDetails.mockReturnValue({
          firstName: 'John',
          surname: 'Smith',
          otherIds: {
            crn: 'X123456',
          },
        })
        page = probationDocumentsFactory(oauthApi, elite2Api, communityApi, systemOauthClient)
          .displayProbationDocumentsPage
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
              profileUrl: 'http://localhost:3000/offenders/G9542VP',
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

      it('should supply page with each conviction', async () => {
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({ active: true }),
          aConviction({ active: false }),
        ])

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithMultipleConvictionMatching([{ active: true }, { active: false }])
        )
      })

      it('should use main offence for conviction', async () => {
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({
            offences: [
              {
                mainOffence: false,
                detail: {
                  code: '00102',
                  description: 'Murder (incl abroad) of infants under 1 year of age - 00102',
                  subCategoryDescription: 'Murder of infants under 1 year of age',
                  form20Code: '20',
                },
                offenceDate: '2018-08-04T00:00:00',
                offenceCount: 1,
              },
              {
                mainOffence: true,
                detail: {
                  code: '00102',
                  description: 'Treason- 00102',
                  subCategoryDescription: 'Treason',
                  form20Code: '20',
                },
                offenceDate: '2018-08-04T00:00:00',
                offenceCount: 1,
              },
              {
                mainOffence: false,
                detail: {
                  code: '00102',
                  description: 'Murder (incl abroad) of infants under 1 year of age - 00102',
                  subCategoryDescription: 'Murder of infants under 1 year of age',
                  form20Code: '20',
                },
                offenceDate: '2018-08-04T00:00:00',
                offenceCount: 1,
              },
            ],
          }),
        ])

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ offence: 'Treason' })
        )
      })

      it('should use sentence with length when present', async () => {
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({
            sentence: {
              description: 'CJA - Indeterminate Public Prot.',
              originalLength: 99,
              originalLengthUnits: 'Years',
              secondLength: 5,
              secondLengthUnits: 'Years',
              defaultLength: 60,
              lengthInDays: 1826,
            },
          }),
        ])

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ title: 'CJA - Indeterminate Public Prot. (99 Years)' })
        )
      })

      it('should just use sentence when length not present', async () => {
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({
            sentence: {
              description: 'CJA - Indeterminate Public Prot.',
            },
          }),
        ])

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ title: 'CJA - Indeterminate Public Prot.' })
        )
      })

      it('should just use latest court outcome when no sentence passed', async () => {
        const conviction = aConviction({
          latestCourtAppearanceOutcome: {
            description: 'Pre Sentence Report',
          },
        })
        delete conviction.sentence

        communityApi.getOffenderConvictions.mockReturnValue([conviction])

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ title: 'Pre Sentence Report' })
        )
      })

      it('should format referral date', async () => {
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({
            referralDate: '2018-09-04',
          }),
        ])

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ date: '04/09/2018' })
        )
      })

      it('should supply institution name when in custody', async () => {
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({
            custody: {
              institution: {
                institutionName: 'Berwyn (HMP)',
              },
            },
          }),
        ])

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ institutionName: 'Berwyn (HMP)' })
        )
      })

      it('should supply offender details from probation', async () => {
        communityApi.getOffenderDetails.mockReturnValue({
          firstName: 'John',
          surname: 'Smith',
          otherIds: {
            crn: 'X123456',
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

        expect(communityApi.getOffenderConvictions).toHaveBeenCalledWith({ token: 'ABC' }, { offenderNo: 'G9542VP' })
      })
    })
    describe('when rendering page', () => {
      const res = {}
      let req
      let page

      beforeEach(() => {
        oauthApi.currentUser.mockReturnValue({
          username: 'USER_ADM',
          active: true,
          name: 'User Name',
          activeCaseLoadId: 'LEI',
        })
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOME_OTHER_ROLE' }])
        elite2Api.userCaseLoads.mockReturnValue([])
        communityApi.getOffenderConvictions.mockReturnValue([])
        communityApi.getOffenderDetails.mockReturnValue({})
        page = probationDocumentsFactory(oauthApi, elite2Api, communityApi, systemOauthClient)
          .displayProbationDocumentsPage
        res.render = jest.fn()

        req = { ...mockReq, params: { offenderNo: 'G9542VP' } }
      })

      it('should render the probation documents page with unavailable message', async () => {
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
