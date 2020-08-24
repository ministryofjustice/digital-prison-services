const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails')
const OffenderDetailsPage = require('../../pages/cellMove/offenderDetailsPage')

const offenderNo = 'A12345'

context('A user can view non associations', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubOffenderFullDetails', {
      ...offenderFullDetails,
      age: 29,
      religion: 'Some religion',
      physicalAttributes: {
        ethnicity: 'White',
        raceCode: 'W1',
      },
      profileInformation: [{ type: 'SEXO', resultValue: 'Heterosexual' }, { type: 'SMOKE', resultValue: 'No' }],
    })
    cy.task('stubMainOffence', [{ offenceDescription: '13 hours overwork' }])
  })

  it('Shows the correct data for non-associations', () => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/offender-details`)
    const offenderDetailsPage = OffenderDetailsPage.verifyOnPage()
    cy.get('.govuk-summary-list--no-border').then($section => {
      cy.get($section)
        .find('dt')
        .then($headings => {
          cy.get($headings)
            .its('length')
            .should('eq', 9)
          expect($headings.get(0).innerText).to.contain('Cell location')
          expect($headings.get(1).innerText).to.contain('Name')
          expect($headings.get(2).innerText).to.contain('Prison number')
          expect($headings.get(3).innerText).to.contain('Age')
          expect($headings.get(4).innerText).to.contain('Religion')
          expect($headings.get(5).innerText).to.contain('Ethnicity')
          expect($headings.get(6).innerText).to.contain('Sexual orientation')
          expect($headings.get(7).innerText).to.contain('Smoker or vaper')
          expect($headings.get(8).innerText).to.contain('Main offence')
        })

      cy.get($section)
        .find('dd')
        .then($summaryValues => {
          cy.get($summaryValues)
            .its('length')
            .should('eq', 9)
          expect($summaryValues.get(0).innerText).to.contain('HMP Moorland')
          expect($summaryValues.get(1).innerText).to.contain('Smith, John')
          expect($summaryValues.get(2).innerText).to.contain('A12345')
          expect($summaryValues.get(3).innerText).to.contain('29')
          expect($summaryValues.get(4).innerText).to.contain('Some religion')
          expect($summaryValues.get(5).innerText).to.contain('White (W1)')
          expect($summaryValues.get(6).innerText).to.contain('Heterosexual')
          expect($summaryValues.get(7).innerText).to.contain('No')
          expect($summaryValues.get(8).innerText).to.contain('13 hours overwork')
        })
    })
    offenderDetailsPage.backLink().contains('Return to select a location')
  })
})
