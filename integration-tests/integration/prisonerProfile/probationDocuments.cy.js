const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

context('Prisoner probation documents', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: ['ROLE_VIEW_PROBATION_DOCUMENTS'] })
    cy.signIn()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      cy.task('stubClientCredentialsRequest')
      cy.task('stubOffenderBasicDetails', offenderBasicDetails)
      cy.task('stubStaff', {
        staffId: 'ITAG_USER',
        details: {
          username: 'ITAG_USER',
          firstName: 'Staff',
          lastName: 'Member',
        },
      })
      cy.task('stubDocuments', {
        offenderNo,
        response: {
          name: {
            forename: 'Norman',
            surname: 'Bates',
          },
          crn: 'X123456',
          documents: [
            {
              id: '1e593ff6-d5d6-4048-a671-cdeb8f65608b',
              name: 'PRE-CONS.pdf',
              author: 'Sandra Becker',
              type: 'PNC previous convictions',
              description: 'Previous convictions as of 01/09/2019',
              createdAt: '2019-09-10T00:00:00',
            },
          ],
          convictions: [
            {
              active: true,
              date: '2018-09-04',
              offence: 'Murder of infants under 1 year of age',
              title: 'CJA - Indeterminate Public Prot. (5 Years)',
              institutionName: 'Berwyn (HMP)',
              documents: [
                {
                  id: 'cc8bf04c-2f8c-4e72-a14b-ab6a5702bf59',
                  name: 'CPSPack1.txt',
                  author: 'Millie Milk',
                  type: 'Crown Prosecution Service case pack',
                  description: 'Crown Prosecution Service case pack for 01/06/2017',
                  createdAt: '2019-09-04T00:00:00',
                },
              ],
            },
            {
              active: false,
              date: '2017-09-04',
              offence: 'Arson',
              title: 'CJA - Community Order. (12 Months)',
              documents: [
                {
                  id: '04897043-6b84-45b8-b278-4fffea477ef3',
                  name: 'CPSPack2.txt',
                  author: 'Barnie Books',
                  type: 'Crown Prosecution Service case pack',
                  description: 'Crown Prosecution Service case pack for 05/05/2017',
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
      cy.get('[data-test="document-link"]').contains('PRE-CONS.pdf')
      cy.get('[data-test="document-link"]').contains('CPSPack1.txt')
      cy.get('[data-test="document-link"]').contains('CPSPack2.txt')
      cy.get('.govuk-accordion__section-heading').contains('CJA - Indeterminate Public Prot. (5 Years) at Berwyn (HMP)')
      cy.get('.govuk-accordion__section-heading').contains('CJA - Community Order. (12 Months)')
    })
  })
})
