context('Select activity location', () => {
  const headerText = 'View by activity or appointment location'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  it('should redirect to the activity lists page', () => {
    cy.task('stubActivityLocations')
    cy.visit('/manage-prisoner-whereabouts/select-location')

    cy.get('h1').contains(headerText)
    cy.get('#current-location').select('loc1')

    cy.get('h1').contains(headerText)
    cy.get('[type="submit"]').click()

    cy.location('pathname').should('eq', '/manage-prisoner-whereabouts/activity-results')
  })
})
