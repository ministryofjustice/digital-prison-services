const HomePage = require('../../pages/homepage/homepagePage')

context('Sign in functionality', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubUserLocations')
    cy.task('stubStaffRoles', [])
    cy.task('stubLocationConfig', { agencyId: 'MDI', response: { enabled: false } })
    cy.task('stubKeyworkerMigrated')
  })

  it('Root (/) redirects to the auth sign in page if not signed in', () => {
    cy.task('stubSignInPage')
    cy.visit('/')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Direct access to login callback takes user to sign in page', () => {
    cy.task('stubSignIn', {})
    cy.visit('/login/callback')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Sign in page redirects to the auth sign in page if not signed in', () => {
    cy.task('stubSignInPage')
    cy.visit('/sign-in')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Page redirects to the auth sign in page if not signed in', () => {
    cy.task('stubSignIn', {})
    cy.visit('/sign-in')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Sign in takes user to sign in page', () => {
    cy.task('stubSignIn', {})
    cy.signIn()
    HomePage.verifyOnPage()

    // can't do a visit here as cypress requires only one domain
    cy.request('/auth/sign-out').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.task('stubSignIn', {})
    cy.signIn()
    HomePage.verifyOnPage()
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.task('stubSignIn', {})
    cy.signIn()
    const homePage = HomePage.verifyOnPage()
    homePage.loggedInName().contains('J. Stuart')
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubUserMe', { name: 'Bobby Brown' })
    cy.signIn()

    homePage.loggedInName().contains('B. Brown')
  })

  it('Sign in as ordinary user', () => {
    cy.task('stubSignIn', {})
    cy.signIn()
    HomePage.verifyOnPage()
  })
})
