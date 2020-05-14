const page = require('../page')

const courtVideoLinkHomePage = () => {
  page('Book a video link with a prison', {
    bookingTitle: () => cy.get('h2:first'),
    appointmentsListTitle: () => cy.get('h2:second'),
    courtServiceFooter: () => cy.get('.qa-court-service-footer'),
  })
}

export default {
  verifyOnPage: courtVideoLinkHomePage,
  goTo: () => {
    cy.visit('/videolink')
    return courtVideoLinkHomePage()
  },
}
