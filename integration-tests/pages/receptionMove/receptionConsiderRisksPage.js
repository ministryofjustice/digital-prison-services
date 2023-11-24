const page = require('../page')

const receptionConsiderRisksPage = () =>
  page('Consider risks of moving this person to reception', {
    errorSummary: () => cy.get('.govuk-error-summary'),
    nonAssociationsLink: () => cy.get("[data-test='non-associations-link']"),
    receptionMoveHeaders: () =>
      cy.get('[data-test="cell-move-header-information"]').then(($header) => {
        cy.get($header)
          .find('h3')
          .then(($headings) => {
            cy.get($headings).its('length').should('eq', 5)
            expect($headings.get(0).innerText).to.contain('Name')
            expect($headings.get(1).innerText).to.contain('Current location')
            expect($headings.get(2).innerText).to.contain('CSRA rating')
            expect($headings.get(3).innerText).to.contain('Relevant alerts')
            expect($headings.get(4).innerText).to.contain('Non-associations')
          })
      }),
    form: () => ({
      submitButton: () => cy.get('button[type="submit"]'),
      confirmMoveYes: () => cy.get('#considerRisksReception'),
      confirmMoveNo: () => cy.get('#considerRisksReception-2'),
      selectReceptionReason: () => cy.get('#reason-3'),
      moveReason: () => cy.get('#comment'),
    }),
  })

export default {
  verifyOnPage: receptionConsiderRisksPage,
  goTo: (offenderNo) => {
    cy.visit(`/prisoner/${offenderNo}/reception-move/consider-risks-reception`, { failOnStatusCode: false })
    return receptionConsiderRisksPage()
  },
}
