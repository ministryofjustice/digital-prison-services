context('Caseload switcher', () => {

  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
  })

  it('should successfully change caseload without redirect', () => {
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'LEI',
      caseloads: [
        {
          caseLoadId: 'MDI',
          description: 'Moorland (HMP)',
          currentlyActive: false,
        },
        {
          caseLoadId: 'LEI',
          description: 'Leeds (HMP)',
          currentlyActive: true,
        },
      ],
    })
    cy.signIn()

    cy.visit('/change-caseload')
    cy.get('#changeCaseloadSelect').select('Moorland (HMP)')
    cy.get('button').click()
    cy.url().should('include', `${Cypress.config('baseUrl')}/change-caseload`)
  })

  context('When user is in a redirecting caseload', () => {

    beforeEach(() => {
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'MDI',
        caseloads: [
          {
            caseLoadId: 'MDI',
            description: 'Moorland (HMP)',
            currentlyActive: true,
          },
          {
            caseLoadId: 'LEI',
            description: 'Leeds (HMP)',
            currentlyActive: false,
          },
        ],
      })
    })

    it('should redirect to the new change caseload page', () => {
      cy.task('stubChangeCaseloadPage')
      cy.signIn('/change-caseload')
      cy.url().should('include', 'dpshomepage/change-caseload')
    })

    it('should redirect to the new change caseload page maintaining params', () => {
      cy.task('stubChangeCaseloadPage')
      cy.signIn('/change-caseload?someParam=quimby')
      cy.url().should('include', 'dpshomepage/change-caseload?someParam=quimby')
    })
  })
})
