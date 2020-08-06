const page = require('../page')

const caseNotePage = offenderName =>
  page(offenderName, {
    filterForm: () => ({
      typeSelect: () => cy.get('#type'),
      subTypeSelect: () => cy.get('#subType'),
      fromDate: () => cy.get('#fromDate'),
      toDate: () => cy.get('#toDate'),
      applyButton: () => cy.get('button'),
    }),
    getRows: () => ({
      createdBy: () => cy.get('.case-notes-created'),
      caseNoteDetails: () => cy.get('.case-notes-details'),
      caseNoteAddMoreDetailsLink: () => cy.get('[data-test="add-more-details"]'),
      caseNotePrintIncentiveLevelSlipLink: () => cy.get('[data-test="print-slip"]'),
    }),
    noDataMessage: () => cy.get('[data-test="no-case-notes"]'),
    viewAllCaseNotesTopLink: () => cy.get('[data-test="view-all-case-notes-top-link"]'),
    viewAllCaseNotesBottomLink: () => cy.get('[data-test="view-all-case-notes-bottom-link"]'),
  })

export default {
  verifyOnPage: caseNotePage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/case-notes`)
    return caseNotePage()
  },
}
