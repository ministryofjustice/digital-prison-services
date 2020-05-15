const page = require('../page')

const courtVideoLinkHomePage = () =>
  page('Book a video link with a prison', {
    bookingTitle: () => cy.get('[data-qa="bookings-link"]'),
    appointmentsListTitle: () => cy.get('[data-qa="appointments-link"]'),
    courtServiceFooter: () => cy.get('.qa-court-service-footer'),
  })

export default {
  verifyOnPage: courtVideoLinkHomePage,
  goTo: () => {
    cy.visit('/videolink')
    return courtVideoLinkHomePage()
  },
}
