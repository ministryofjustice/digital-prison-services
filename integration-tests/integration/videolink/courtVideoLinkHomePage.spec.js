const CourtVideoLinkHomePage = require('../../pages/videolink/courtVideoLinkHomePage')

context('A user can view the video link home page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
  })

  it('should redirect a video court user to the video link home page', () => {
    cy.task('stubLocationGroups')
    cy.task('stubGroups', 'MDI')
    cy.task('stubActivityLocations')

    cy.visit('/')

    CourtVideoLinkHomePage.verifyOnPage()
  })

  it('should redirect a video court user to the video link home page', () => {
    cy.task('stubLocationGroups')
    cy.task('stubActivityLocations')

    cy.visit('/')

    CourtVideoLinkHomePage.verifyOnPage()
  })

  it('A user can view the video link home page', () => {
    const courtVideoLinkHomePage = CourtVideoLinkHomePage.goTo()
    courtVideoLinkHomePage.bookingTitle().contains('Book a video link for a single person')
    courtVideoLinkHomePage.appointmentsListTitle().contains('View all video link bookings')
  })
})
