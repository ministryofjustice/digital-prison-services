const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

context('Prisoner adjudication details', () => {
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
      cy.task('stubOffenderBasicDetails', offenderBasicDetails)
      cy.task('stubGetAdjudicationDetails', {
        adjudicationNumber: 123,
        incidentTime: '2016-10-19T10:00:00',
        establishment: 'Moorland (HMP & YOI)',
        interiorLocation: 'Health Care',
        incidentDetails: 'Something happened',
        reportNumber: 1392002,
        reportType: "Governor's Report",
        reporterFirstName: 'DUDFSANAYE',
        reporterLastName: 'FLORENZO',
        reportTime: '2016-10-19T10:57:00',
        hearings: [
          {
            oicHearingId: 1,
            hearingType: "Governor's Hearing Adult",
            hearingTime: '2016-10-21T10:00:00',
            heardByFirstName: 'John',
            heardByLastName: 'Smith',
            establishment: 'Moorland (HMP & YOI)',
            location: 'Adj',
            results: [
              {
                oicOffenceCode: '51:16',
                offenceType: 'Prison Rule 51',
                offenceDescription:
                  'Intentionally or recklessly sets fire to any part of a prison or any other property, whether or not his own',
                plea: 'Guilty',
                finding: 'Charge Proved',
                sanctions: [
                  {
                    sanctionType: 'Forfeiture of Privileges',
                    sanctionDays: 14,
                    effectiveDate: '2016-10-21T00:00:00',
                    status: 'Immediate',
                    statusDate: '2016-10-21T12:00:00',
                    comment: 'No privileges comment',
                    sanctionSeq: 14,
                  },
                  {
                    sanctionType: 'Cellular Confinement',
                    sanctionDays: 7,
                    effectiveDate: '2016-10-23T00:00:00',
                    status: 'Immediate',
                    statusDate: '2016-10-25T15:00:00',
                    comment: 'Confinement comment',
                    sanctionSeq: 15,
                  },
                ],
              },
            ],
          },
          {
            oicHearingId: 2,
            hearingType: "Governor's Hearing Adult",
            hearingTime: '2018-10-25T10:00:00',
            heardByFirstName: 'Steve',
            heardByLastName: 'Jones',
            comment: 'A hearing comment',
            establishment: 'Moorland (HMP & YOI)',
            location: 'Adj',
            results: [],
          },
        ],
      })
    })

    it('should load the data correctly', () => {
      cy.visit(`/prisoner/${offenderNo}/adjudications/123456`)

      cy.get('h1').should('contain', 'Adjudication 123 details')
      cy.get('[data-test="governors-report-title"]').should('contain', 'Governor`s report number 1392002')
      cy.get('[data-test="incident-time"]').should('contain', '19/10/2016 - 10:00')
      cy.get('[data-test="incident-location"]').should('contain', 'Health Care, Moorland (HMP & YOI)')
      cy.get('[data-test="incident-reported-by"]').should('contain', 'Florenzo, Dudfsanaye')
      cy.get('[data-test="incident-reported-time"]').should('contain', '19/10/2016 - 10:57')
      cy.get('[data-test="incident-comments"]').should('contain', 'Something happened')

      cy.get('[data-test="hearing"]')
        .eq(0)
        .then($hearing => {
          cy.get($hearing)
            .find('[data-test="hearing-title"]')
            .should('contain', 'Hearing held on 25 October 2018 - 10:00')

          cy.get($hearing)
            .find('[data-test="hearing-type"]')
            .should('contain', "Governor's Hearing Adult")

          cy.get($hearing)
            .find('[data-test="hearing-location"]')
            .should('contain', 'Adj')

          cy.get($hearing)
            .find('[data-test="hearing-heard-by"]')
            .should('contain', 'Jones, Steve')

          cy.get($hearing)
            .find('[data-test="hearing-comments"]')
            .should('contain', 'A hearing comment')

          cy.get($hearing)
            .find('[data-test="hearing-results"]')
            .should('not.exist')
        })

      cy.get('[data-test="hearing"]')
        .eq(1)
        .then($hearing => {
          cy.get($hearing)
            .find('[data-test="hearing-title"]')
            .should('contain', 'Hearing held on 21 October 2016 - 10:00')

          cy.get($hearing)
            .find('[data-test="hearing-type"]')
            .should('contain', "Governor's Hearing Adult")

          cy.get($hearing)
            .find('[data-test="hearing-location"]')
            .should('contain', 'Adj')

          cy.get($hearing)
            .find('[data-test="hearing-heard-by"]')
            .should('contain', 'Smith, John')

          cy.get($hearing)
            .find('[data-test="hearing-comments"]')
            .should('contain', 'Not entered')

          cy.get($hearing)
            .find('[data-test="hearing-results"]')
            .then($table => {
              cy.get($table)
                .find('td')
                .then($tableCells => {
                  cy.get($tableCells)
                    .its('length')
                    .should('eq', 5) // 1 row with 5 cells

                  expect($tableCells.get(0)).to.contain('51:16')
                  expect($tableCells.get(1)).to.contain('Prison Rule 51')
                  expect($tableCells.get(2)).to.contain(
                    'Intentionally or recklessly sets fire to any part of a prison or any other property, whether or not his own'
                  )
                  expect($tableCells.get(3)).to.contain('Guilty')
                  expect($tableCells.get(4)).to.contain('Charge Proved')
                })
            })

          cy.get('[data-test="hearing-awards"]').then($table => {
            cy.get($table)
              .find('td')
              .then($tableCells => {
                cy.get($tableCells)
                  .its('length')
                  .should('eq', 10) // 2 rows with 5 cells

                expect($tableCells.get(0)).to.contain('Forfeiture of Privileges')
                expect($tableCells.get(1)).to.contain('14 days')
                expect($tableCells.get(2)).to.contain('21/10/2016')
                expect($tableCells.get(3)).to.contain('Immediate')
                expect($tableCells.get(4)).to.contain('21/10/2016')

                expect($tableCells.get(5)).to.contain('Cellular Confinement')
                expect($tableCells.get(6)).to.contain('7 days')
                expect($tableCells.get(7)).to.contain('23/10/2016')
                expect($tableCells.get(8)).to.contain('Immediate')
                expect($tableCells.get(9)).to.contain('25/10/2016')
              })
          })

          cy.get($hearing)
            .find('[data-test="award-comment"]')
            .eq(0)
            .should('contain', 'No privileges comment')

          cy.get($hearing)
            .find('[data-test="award-comment"]')
            .eq(1)
            .should('contain', 'Confinement comment')
        })
    })
  })
})
