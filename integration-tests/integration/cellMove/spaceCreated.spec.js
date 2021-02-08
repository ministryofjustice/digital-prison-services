const spaceCreatedPage = require('../../pages/cellMove/spaceCreatedPage')

const offenderNo = 'A1234A'

context('A user get confirmation of a cell move', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubBookingDetails', {
      firstName: 'Bob',
      lastName: 'Doe',
      offenderNo,
      bookingId: 1234,
    })
    cy.task('stubLocation', {
      locationId: 1,
      locationData: { parentLocationId: 2, description: 'MDI-1-1', locationPrefix: 'MDI-1' },
    })
    cy.task('stubAttributesForLocation', {
      capacity: 2,
    })
    cy.task('stubMoveToCell')
  })

  it('should page with the correct offender name', () => {
    const page = spaceCreatedPage.goTo({ offenderNo, name: 'Bob Doe' })

    page
      .backToSearchLink()
      .invoke('attr', 'href')
      .then(href => {
        expect(href).to.equal('/prisoner-search')
      })
  })
})
