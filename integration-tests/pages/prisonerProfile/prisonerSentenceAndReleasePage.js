const page = require('../page')

const prisonerSentenceAndReleasePage = offenderName =>
  page(offenderName, {
    releaseDatesAccordion: () => cy.get('#prisoner-accordion-headind-1'),
    currentReleaseDatesHeading: () => cy.get('[data-test="current-expected-heading"'),
    currentReleaseDates: () => cy.get('[data-test="current-expected"'),
    earlyTemporaryDatesHeading: () => cy.get('[data-test="early-temporary-heading"'),
    earlyTemporaryDates: () => cy.get('[data-test="early-temporary"'),
    licenceDatesHeading: () => cy.get('[data-test="licence-dates-heading"'),
    licenceDates: () => cy.get('[data-test="licence-dates"'),
    otherReleaseDatesHeading: () => cy.get('[data-test="other-release-dates-heading"'),
    otherReleaseDates: () => cy.get('[data-test="other-release-dates"'),
    noReleaseDatesMessage: () => cy.get('[data-test="no-release-dates-message"'),
    noSentenceAdjustmentsMessage: () => cy.get('[data-test="no-sentence-adjustments-message"]'),
    sentenceAdjustmentsDaysAddedSection: () => cy.get('[data-test="sentence-adjustments-days-added-section"]'),
    sentenceAdjustmentsDaysRemovedSection: () => cy.get('[data-test="sentence-adjustments-days-removed-section"]'),
    sentenceAdjustmentsDaysRemainingSection: () => cy.get('[data-test="sentence-adjustments-days-remaining-section"]'),
    caseNumber: () => cy.get('[data-test="case-number"]'),
    sentenceDate: () => cy.get('[data-test="sentence-date"]'),
    sentenceHeader: () => cy.get('[data-test="sentence-header"]'),
    sentenceTerms: () => cy.get('[data-test="sentence-terms"]'),
    offenceDescriptions: () => cy.get('[data-test="offence-description"]'),
    sentenceDescriptions: () => cy.get('[data-test="sentence-description"]'),
    effectiveSentenceEndDate: () => cy.get('[data-test="effective-sentence-end-date"]'),
    courtName: () => cy.get('[data-test="court-name"]'),
    offenceHeader: () => cy.get('[data-test="offence-header"]'),
    inlineOffenceDescription: () => cy.get('[data-test="inline-offence-description"]'),
    noSentenceDataMessage: () => cy.get('[data-test="no-sentence-data-message"]'),
  })

export default {
  verifyOnPage: prisonerSentenceAndReleasePage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/sentence-and-releasealerts`)
    return prisonerSentenceAndReleasePage()
  },
}
