const CourtVideoLinkHomePage = require('../../pages/videolink/courtVideoLinkHomePage')

context('A user can view the video link home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.login()
  })

  it('A user can view the video link home page', () => {
    const courtVideoLinkHomePage = CourtVideoLinkHomePage.verifyOnPage()
    courtVideoLinkHomePage.bookingTitle().contains('Book a video link with a prison')
  })
})
