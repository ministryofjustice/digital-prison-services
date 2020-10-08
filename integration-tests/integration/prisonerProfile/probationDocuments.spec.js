const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

context('Prisoner probation documents', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubUserMeRoles', [{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }])
      cy.task('stubClientCredentialsRequest')
      cy.task('stubOffenderBasicDetails', offenderBasicDetails)
      cy.task('stubStaff', 'ITAG_USER', {
        username: 'ITAG_USER',
        firstName: 'Staff',
        lastName: 'Member',
      })
      cy.task('stubConvictions', {
        offenderNo,
        convictions: [
          {
            convictionId: 1,
            index: '1',
            active: true,
            Breach: false,
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
                offenderId: 1,
                createdDatetime: '2019-09-04T12:13:48',
                lastUpdatedDatetime: '2019-09-04T12:13:48',
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
          {
            convictionId: 2,
            index: '2',
            active: false,
            Breach: false,
            convictionDate: '2018-09-03',
            referralDate: '2017-09-04',
            offences: [
              {
                offenceId: 'M2500295343',
                mainOffence: true,
                detail: {
                  code: '05600',
                  description: 'Arson - 05600',
                  mainCategoryCode: '056',
                  mainCategoryDescription: 'Arson',
                  mainCategoryAbbreviation: 'Arson',
                  ogrsOffenceCategory: 'Criminal damage',
                  subCategoryCode: '00',
                  subCategoryDescription: 'Arson',
                  form20Code: '58',
                },
                offenceDate: '2017-08-04T00:00:00',
                offenceCount: 2,
                offenderId: 1,
                createdDatetime: '2018-09-04T12:13:48',
                lastUpdatedDatetime: '2018-09-04T12:13:48',
              },
            ],
            sentence: {
              description: 'CJA - Community Order.',
              originalLength: 12,
              originalLengthUnits: 'Months',
              defaultLength: 12,
              lengthInDays: 364,
            },
            latestCourtAppearanceOutcome: {
              code: '201',
              description: 'CJA - Community Order.',
            },
          },
        ],
      })

      cy.task('stubOffenderDetails', {
        offenderNo,
        details: {
          firstName: 'Norman',
          surname: 'Bates',
          otherIds: {
            crn: 'X123456',
          },
        },
      })

      cy.task('stubDocuments', {
        offenderNo,
        documents: {
          documents: [
            {
              id: '1e593ff6-d5d6-4048-a671-cdeb8f65608b',
              documentName: 'PRE-CONS.pdf',
              author: 'Sandra Becker',
              type: {
                code: 'PRECONS_DOCUMENT',
                description: 'PNC previous convictions',
              },
              extendedDescription: 'Previous convictions as of 01/09/2019',
              createdAt: '2019-09-10T00:00:00',
            },
          ],
          convictions: [
            {
              convictionId: '1',
              documents: [
                {
                  id: 'cc8bf04c-2f8c-4e72-a14b-ab6a5702bf59',
                  documentName: 'CPSPack1.txt',
                  author: 'Millie Milk',
                  type: {
                    code: 'CPSPACK_DOCUMENT',
                    description: 'Crown Prosecution Service case pack',
                  },
                  extendedDescription: 'Crown Prosecution Service case pack for 01/06/2017',
                  createdAt: '2019-09-04T00:00:00',
                },
              ],
            },
            {
              convictionId: '2',
              documents: [
                {
                  id: '04897043-6b84-45b8-b278-4fffea477ef3',
                  documentName: 'CPSPack2.txt',
                  author: 'Barnie Books',
                  type: {
                    code: 'CPSPACK_DOCUMENT',
                    description: 'Crown Prosecution Service case pack',
                  },
                  extendedDescription: 'Crown Prosecution Service case pack for 05/05/2017',
                  createdAt: '2019-09-05T00:00:00',
                },
              ],
            },
          ],
        },
      })

      cy.task('stubDocument', {
        offenderNo,
        documentId: '1e593ff6-d5d6-4048-a671-cdeb8f65608b',
        content: '1234',
      })
    })

    it('should allow the user to download the document', () => {
      cy.visit(`/offenders/${offenderNo}/probation-documents`)
      cy.get('.govuk-accordion__section-button').click({ multiple: true })
      cy.get('.qa-document-link').contains('PRE-CONS.pdf')
      cy.get('.qa-document-link').contains('CPSPack1.txt')
      cy.get('.qa-document-link').contains('CPSPack2.txt')
      cy.get('.govuk-accordion__section-heading').contains('CJA - Indeterminate Public Prot. (5 Years) at Berwyn (HMP)')
      cy.get('.govuk-accordion__section-heading').contains('CJA - Community Order. (12 Months)')
    })
  })
})
