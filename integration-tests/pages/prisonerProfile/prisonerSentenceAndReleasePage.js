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
  })

export default {
  verifyOnPage: prisonerSentenceAndReleasePage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/sentence-and-releasealerts`)
    return prisonerSentenceAndReleasePage()
  },
}
