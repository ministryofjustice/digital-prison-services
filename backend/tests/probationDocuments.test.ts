import { probationDocumentsFactory } from '../controllers/probationDocuments'

function aDocument(overrides = {}) {
  return {
    id: '1e593ff6-d5d6-4048-a671-cdeb8f65608b',
    documentName: 'PRE-CONS.pdf',
    author: 'Andy Marke',
    type: {
      code: 'PRECONS_DOCUMENT',
      description: 'PNC previous convictions',
    },
    extendedDescription: 'Previous convictions as of 01/09/2019',
    createdAt: '2019-09-10T00:00:00',
    ...overrides,
  }
}

function aConviction(overrides = {}) {
  return {
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
  const theError = new Error(message)
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type 'Error'.
  theError.status = status
  return theError
}

describe('Probation documents', () => {
  const oauthApi = {}
  const prisonApi = {}
  const communityApi = {}
  const systemOauthClient = {}
  const getDetailsResponse = { agencyId: 'LEI', bookingId: 1234, firstName: 'Test', lastName: 'User' }

  describe('Controller', () => {
    const mockReq = { flash: jest.fn().mockReturnValue([]), originalUrl: '/offenders/G9542VP/probation-documents' }
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userCaseLoads = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
      oauthApi.currentUser = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
      communityApi.getOffenderConvictions = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDetails' does not exist on ty... Remove this comment to see the full error message
      communityApi.getOffenderDetails = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
      communityApi.getOffenderDocuments = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      systemOauthClient.getClientCredentialsTokens = jest.fn()

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      systemOauthClient.getClientCredentialsTokens.mockReturnValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
      oauthApi.currentUser.mockReturnValue({
        username: 'USER_ADM',
        active: true,
        name: 'User Name',
        activeCaseLoadId: 'LEI',
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
      prisonApi.userCaseLoads.mockReturnValue([
        {
          currentlyActive: true,
          caseLoadId: 'LEI',
          description: 'Description',
        },
      ])
    })

    describe('when rendering page', () => {
      const res = {}
      let req
      let page

      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDetails' does not exist on ty... Remove this comment to see the full error message
        communityApi.getOffenderDetails.mockReturnValue({
          firstName: 'John',
          surname: 'Smith',
          otherIds: {
            crn: 'X123456',
          },
        })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({
          documents: [],
          convictions: [],
        })
        page = probationDocumentsFactory(
          oauthApi,
          prisonApi,
          communityApi,
          systemOauthClient
        ).displayProbationDocumentsPage
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        res.render = jest.fn()

        req = { ...mockReq, params: { offenderNo: 'G9542VP' } }
      })

      it('should render the probation documents page with title', async () => {
        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            title: 'Probation documents - Digital Prison Services',
          })
        )
      })

      it('should render the probation documents page with no errors', async () => {
        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            errors: [],
          })
        )
      })

      it('should supply page with user and caseload', async () => {
        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({
          documents: [aDocument({ id: '1' }), aDocument({ id: '2' })],
          convictions: [],
        })

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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

      it('should sort offender related documents by createdAt', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({
          documents: [
            aDocument({ id: '1', createdAt: '2019-09-09T00:00:00' }),
            aDocument({ id: '2', createdAt: '2019-09-10T00:00:00' }),
            aDocument({ id: '3', createdAt: '2019-09-08T00:00:00' }),
          ],
          convictions: [],
        })

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [
                expect.objectContaining({ id: '2' }),
                expect.objectContaining({ id: '1' }),
                expect.objectContaining({ id: '3' }),
              ],
              convictions: [],
            },
          })
        )
      })

      it('should supply page with mapped offender related document', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({
          documents: [
            aDocument({
              documentName: 'PRE-CONS.pdf',
              author: 'Kate Bracket',
              type: {
                code: 'PRECONS_DOCUMENT',
                description: 'PNC previous convictions',
              },
              extendedDescription: 'Previous convictions as of 01/09/2019',
              createdAt: '2019-09-10T00:00:00',
            }),
          ],
          convictions: [],
        })

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [
                {
                  author: 'Kate Bracket',
                  date: '10/09/2019',
                  description: 'Previous convictions as of 01/09/2019',
                  documentName: 'PRE-CONS.pdf',
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({})

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([aConviction({ convictionId: 1 })])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({})

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({ convictionId: 1 }),
          aConviction({ convictionId: 2 }),
        ])

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({
          documents: [],
          convictions: [
            {
              convictionId: '1',
              documents: [aDocument({ id: '1' }), aDocument({ id: '2' })],
            },
            {
              convictionId: '2',
              documents: [aDocument({ id: '3' }), aDocument({ id: '4' })],
            },
          ],
        })

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
      it('should supply page with conviction related documents sorted by createdAt', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([aConviction({ convictionId: 1 })])

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({
          documents: [],
          convictions: [
            {
              convictionId: '1',
              documents: [
                aDocument({ id: '1', createdAt: '2019-09-09T00:00:00' }),
                aDocument({ id: '2', createdAt: '2019-09-10T00:00:00' }),
                aDocument({ id: '3', createdAt: '2019-09-08T00:00:00' }),
              ],
            },
          ],
        })

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          expect.objectContaining({
            documents: {
              offenderDocuments: [],
              convictions: expect.objectContaining([
                expect.objectContaining({
                  documents: [
                    expect.objectContaining({ id: '2' }),
                    expect.objectContaining({ id: '1' }),
                    expect.objectContaining({ id: '3' }),
                  ],
                }),
              ]),
            },
          })
        )
      })

      it('should supply page with mapped document for conviction', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([aConviction({ convictionId: 1 })])

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
        communityApi.getOffenderDocuments.mockReturnValue({
          documents: [],
          convictions: [
            {
              convictionId: '1',
              documents: [
                aDocument({
                  documentName: 'PRE-CONS.pdf',
                  author: 'Kate Bracket',
                  type: {
                    code: 'PRECONS_DOCUMENT',
                    description: 'PNC previous convictions',
                  },
                  extendedDescription: 'Previous convictions as of 01/09/2019',
                  createdAt: '2019-09-10T00:00:00',
                }),
              ],
            },
          ],
        })

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
                      date: '10/09/2019',
                      description: 'Previous convictions as of 01/09/2019',
                      documentName: 'PRE-CONS.pdf',
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({ active: true }),
          aConviction({ active: false }),
        ])

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithMultipleConvictionMatching([{ active: true }, { active: false }])
        )
      })

      it('should use main offence for conviction', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
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

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ offence: 'Treason' })
        )
      })

      it('should use sentence with length when present', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
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

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ title: 'CJA - Indeterminate Public Prot. (99 Years)' })
        )
      })

      it('should just use sentence when length not present', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({
            sentence: {
              description: 'CJA - Indeterminate Public Prot.',
            },
          }),
        ])

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([conviction])

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ title: 'Pre Sentence Report' })
        )
      })

      it('should format referral date', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([
          aConviction({
            referralDate: '2018-09-04',
          }),
        ])

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ date: '04/09/2018' })
        )
      })

      it('should supply institution name when in custody', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
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

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        expect(res.render).toHaveBeenCalledWith(
          'probationDocuments.njk',
          documentsWithSingleConvictionMatching({ institutionName: 'Berwyn (HMP)' })
        )
      })

      it('should supply offender details from probation', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDetails' does not exist on ty... Remove this comment to see the full error message
        communityApi.getOffenderDetails.mockReturnValue({
          firstName: 'John',
          surname: 'Smith',
          otherIds: {
            crn: 'X123456',
          },
        })

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        systemOauthClient.getClientCredentialsTokens.mockReturnValue({ token: 'ABC' })
        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        expect(communityApi.getOffenderConvictions).toHaveBeenCalledWith({ token: 'ABC' }, { offenderNo: 'G9542VP' })
      })
      describe('access to the page based on role and caseload', () => {
        it('should not allow access to page if user does not have role', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOME_OTHER_ROLE' }])
          await page(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
          prisonApi.getDetails = jest.fn().mockReturnValue({ ...getDetailsResponse, agencyId: 'MDI' })
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([
            { caseLoadId: 'BXI', currentlyActive: true },
            { caseLoadId: 'WWI' },
          ])
          // @ts-expect-error ts-migrate(2339)
          oauthApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })

          await page(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
          prisonApi.getDetails = jest.fn().mockReturnValue({ ...getDetailsResponse, agencyId: 'OUT' })
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([
            { caseLoadId: 'BXI', currentlyActive: true },
            { caseLoadId: 'WWI' },
          ])
          // @ts-expect-error ts-migrate(2339)
          oauthApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })

          await page(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
          prisonApi.getDetails = jest.fn().mockReturnValue({ ...getDetailsResponse, agencyId: 'BXI' })
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([
            { caseLoadId: 'BXI', currentlyActive: true },
            { caseLoadId: 'WWI' },
          ])
          // @ts-expect-error ts-migrate(2339)
          oauthApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })

          await page(req, res)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
          expect(res.render).toHaveBeenCalledWith(
            'probationDocuments.njk',
            expect.objectContaining({
              errors: [],
            })
          )
        })

        it('should allow access to page if user has the correct role and is in one of your other caseloads', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
          prisonApi.getDetails = jest.fn().mockReturnValue({ ...getDetailsResponse, agencyId: 'WWI' })
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([
            { caseLoadId: 'BXI', currentlyActive: true },
            { caseLoadId: 'WWI' },
          ])
          // @ts-expect-error ts-migrate(2339)
          oauthApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'BXI' })

          await page(req, res)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
      const res = {}
      let req
      let page

      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
        communityApi.getOffenderConvictions.mockReturnValue([])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDetails' does not exist on ty... Remove this comment to see the full error message
        communityApi.getOffenderDetails.mockReturnValue({})
        page = probationDocumentsFactory(
          oauthApi,
          prisonApi,
          communityApi,
          systemOauthClient
        ).displayProbationDocumentsPage
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        res.render = jest.fn()

        req = { ...mockReq, params: { offenderNo: 'G9542VP' } }
      })

      describe('when offender not found in probation', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
          communityApi.getOffenderConvictions.mockReturnValue([])
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDetails' does not exist on ty... Remove this comment to see the full error message
          communityApi.getOffenderDetails.mockRejectedValue(error('Not found', 404))
        })
        it('should render page with offender not found message', async () => {
          await page(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderConvictions' does not exist o... Remove this comment to see the full error message
          communityApi.getOffenderConvictions.mockReturnValue([])
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDetails' does not exist on ty... Remove this comment to see the full error message
          communityApi.getOffenderDetails.mockRejectedValue(error('Server error', 503))
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderDocuments' does not exist on ... Remove this comment to see the full error message
          communityApi.getOffenderDocuments.mockReturnValue([])
        })
        it('should render page with system error message', async () => {
          await page(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
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
