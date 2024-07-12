const homepagePage = require('../pages/homepage/homepagePage')

context('Common component functionality', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubUserLocations')
    cy.task('stubStaffRoles', { roles: [] })
    cy.task('stubLocationConfig', { agencyId: 'MDI', response: { enabled: false } })
    cy.task('stubKeyworkerMigrated')
    cy.task('stubComponents')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'MDI',
      caseloads: [
        {
          caseLoadId: 'MDI',
          description: 'Moorland',
          currentlyActive: true,
        },
        {
          caseLoadId: 'WWI',
          description: 'Wandsworth',
          currentlyActive: false,
        },
      ],
    })
    cy.signIn()

    cy.task('stubPSInmates', {
      locationId: 'MDI',
      count: 0,
      data: [],
    })
    cy.visit(`/prisoner-search?feature=new`)
  })

  it('Sign in takes user to sign in page', () => {
    cy.task('stubComponents')
    cy.visit(`/prisoner-search?feature=new`)
    const page = homepagePage.homepagePage('Prisoner search results')
    page.commonComponentsHeader().should('exist')
    page.commonComponentsFooter().should('exist')
  })
})
