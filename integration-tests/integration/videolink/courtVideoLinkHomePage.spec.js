const CourtVideoLinkHomePage = require('../../pages/videolink/courtVideoLinkHomePage')

context('A user can view the video link home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
    cy.visit('/videolink')
  })

  it('A user can view the video link home page', () => {
    const courtVideoLinkHomePage = CourtVideoLinkHomePage.goTo()
    courtVideoLinkHomePage.bookingTitle().contains('Book a video link for a single person')
    courtVideoLinkHomePage.appointmentsListTitle().contains('View all video link bookings')
  })
})
