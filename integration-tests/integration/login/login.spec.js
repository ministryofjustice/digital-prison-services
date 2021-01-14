const HomePage = require('../../pages/homepage/homepagePage')

context('Login functionality', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubUserMeRoles')
    cy.task('stubUserLocations')
    cy.task('stubStaffRoles', [])
    cy.task('stubLocationConfig', { agencyId: 'MDI', response: { enabled: false } })
  })

  it('Root (/) redirects to the auth login page if not logged in', () => {
    cy.task('stubLoginPage')
    cy.visit('/')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Login page redirects to the auth login page if not logged in', () => {
    cy.task('stubLoginPage')
    cy.visit('/login')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Page redirects to the auth login page if not logged in', () => {
    cy.task('stubLogin', {})
    cy.visit('/login')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Logout takes user to login page', () => {
    cy.task('stubLogin', {})
    cy.login()
    HomePage.verifyOnPage()

    // can't do a visit here as cypress requires only one domain
    cy.request('/auth/logout')
      .its('body')
      .should('contain', 'Sign in')
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.task('stubLogin', {})
    cy.login()
    HomePage.verifyOnPage()
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/')
      .its('body')
      .should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.task('stubLogin', {})
    cy.login()
    const homePage = HomePage.verifyOnPage()
    homePage.loggedInName().contains('J. Stuart')
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/')
      .its('body')
      .should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubUserMe', { name: 'Bobby Brown' })
    cy.login()

    homePage.loggedInName().contains('B. Brown')
  })

  it('Log in as ordinary user', () => {
    cy.task('stubLogin', {})
    cy.login()
    HomePage.verifyOnPage()
  })
})
