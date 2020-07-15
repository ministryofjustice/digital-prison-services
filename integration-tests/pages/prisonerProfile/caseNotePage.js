const page = require('../page')

const caseNotePage = offenderName =>
  page(offenderName, {
    filterForm: () => ({
      typeSelect: () => cy.get('#type'),
      subTypeSelect: () => cy.get('#subType'),
      applyButton: () => cy.get('button'),
    }),
    getRows: () => ({
      createdBy: () => cy.get('.case-notes-created'),
      caseNoteDetails: () => cy.get('.case-notes-details'),
      caseNoteAddMoreDetailsLink: () => cy.get('[data-test="add-more-details"]'),
      caseNotePrintIncentiveLevelSlipLink: () => cy.get('[data-test="print-slip"]'),
    }),
  })

export default {
  verifyOnPage: caseNotePage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/case-notes`)
    return caseNotePage()
  },
}
