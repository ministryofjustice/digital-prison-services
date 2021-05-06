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
})
