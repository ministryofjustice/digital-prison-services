context('Whereabouts homepage', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
  })

  describe('Tasks', () => {
    beforeEach(() => {
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'MDI',
        roles: ['ROLE_BULK_APPOINTMENTS', 'ROLE_PRISON'],
      })
      cy.signIn()
    })

    it('should show covid unit task', () => {
      cy.visit('/manage-prisoner-whereabouts')
      cy.get('[data-test="view-covid-units"]').should('exist')
    })

    it('should show bulk appointments task', () => {
      cy.visit('/manage-prisoner-whereabouts')
      cy.get('[data-test="view-bulk-appointments"]').should('exist')
    })

    it('should show all tasks in correct order', () => {
      cy.visit('/manage-prisoner-whereabouts')
      cy.get('.card')
        .find('h2')
        .then((heading) => {
          expect(heading.get(0).innerText).to.contain('View by residential location')
          expect(heading.get(1).innerText).to.contain('View by activity or appointment location')
          expect(heading.get(2).innerText).to.contain('View all appointments')
          expect(heading.get(3).innerText).to.contain('View prisoners unaccounted for')
          expect(heading.get(4).innerText).to.contain('View attendance reason statistics')
          expect(heading.get(5).innerText).to.contain('People due to leave')
          expect(heading.get(6).innerText).to.contain('View COVID units')
          expect(heading.get(7).innerText).to.contain('Add bulk appointments')
        })
    })
  })
})

context('No permissions', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'MDI',
    })
    cy.signIn()
  })

  it('should non role specific tasks', () => {
    cy.visit('/manage-prisoner-whereabouts')

    cy.get('[data-test="view-residential-location"]').should('exist')
    cy.get('[data-test="view-activity-location"]').should('exist')
    cy.get('[data-test="view-all-appointments"]').should('exist')
    cy.get('[data-test="view-unaccounted-for"]').should('exist')
    cy.get('[data-test="view-attendance-statistics"]').should('exist')
    cy.get('[data-test="view-people-due-to-leave"]').should('exist')
    cy.get('[data-test="view-bulk-appointments"]').should('not.exist')
    cy.get('[data-test="view-covid-units"]').should('not.exist')
  })
})
