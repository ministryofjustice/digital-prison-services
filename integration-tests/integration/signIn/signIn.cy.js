const HomePage = require('../../pages/homepage/homepagePage')

context('Sign in functionality', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubUserLocations')
    cy.task('stubStaffRoles', { roles: [] })
    cy.task('stubLocationConfig', { agencyId: 'MDI', response: { enabled: false } })
    cy.task('stubComponentsFail')
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

  it('Page shown when roles are unauthorised', () => {
    cy.task('stubSignIn', {})
    cy.task('stubStaffRoles', { roles: [], status: 403 })
    cy.signIn()
    HomePage.verifyOnPage()

    // can't do a visit here as cypress requires only one domain
    cy.request('/auth/sign-out').its('body').should('contain', 'Sign in')
  })

  it('Page shown when roles are not found', () => {
    cy.task('stubSignIn', {})
    cy.task('stubStaffRoles', { roles: [], status: 404 })
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
    cy.task('stubPSInmates', {
      locationId: 'MDI',
      count: 0,
      data: [],
    })
    cy.task('stubUserLocations')
    cy.signIn()
    cy.visit(`/prisoner-search?feature=new`)
    const homePage = HomePage.verifyOnPage('Prisoner search results')
    homePage.fallbackHeaderUserName().contains('J. Stuart')
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubUserMe', { name: 'Bobby Brown' })
    cy.signIn()
    cy.visit(`/prisoner-search?feature=new`)

    homePage.fallbackHeaderUserName().contains('B. Brown')
  })

  it('Sign in as ordinary user', () => {
    cy.task('stubSignIn', {})
    cy.signIn()
    HomePage.verifyOnPage()
  })
})
