context('Cell move homepage', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
  })

  describe('Tasks', () => {
    beforeEach(() => {
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI', roles: [{ roleCode: 'CELL_MOVE' }] })
      cy.login()
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
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI', roles: [] })
      cy.login()
    })

    it('should display page not found', () => {
      cy.visit('/change-someones-cell', { failOnStatusCode: false })

      cy.get('h1').contains('Page not found')
    })
  })
})
