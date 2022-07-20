context('Cell move homepage', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
  })

  describe('Tasks', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: ['ROLE_CELL_MOVE'] })
      cy.signIn()
    })

    it('should non role specific tasks', () => {
      cy.visit('/change-someones-cell')

      cy.get('[data-test="search-for-prisoner"]').should('exist')
      cy.get('[data-test="view-residential-location"]').should('exist')
      cy.get('[data-test="create-space"]').should('exist')
      cy.get('[data-test="view-history"]').should('contain', 'Moorland')
      cy.get('[data-test="no-cell-allocated"]').should('exist')
    })
  })

  context('When the user does not have the correct cell move roles', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: [] })
      cy.signIn()
    })

    it('should display page not found', () => {
      cy.visit('/change-someones-cell', { failOnStatusCode: false })

      cy.get('h1').contains('Page not found')
    })
  })
})
