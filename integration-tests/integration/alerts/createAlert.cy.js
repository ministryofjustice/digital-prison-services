const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const CreateAlertPage = require('../../pages/alerts/createAlertPage')
const NotFoundPage = require('../../pages/notFound')
const NoCaseloadsPage = require('../../pages/prisonerProfile/noCaseloads')

context('A user can add an alert', () => {
  beforeEach(() => {
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [], roles: ['ROLE_UPDATE_ALERT'] })

    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.signIn()
    })

    const offenderNo = 'A12345'
    cy.task('stubOffenderFullDetails', offenderFullDetails)
    cy.task('stubAlertTypes')
    cy.task('stubCreateAlert')
    cy.task('stubUserCaseLoads')

    cy.visit(`/offenders/${offenderNo}/create-alert`)
  })

  it('A user can successfully add an alert', () => {
    cy.task('stubClientCredentialsRequest')
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo: 'A12345',
    })
    cy.task('stubAlertsForBooking', [])

    cy.intercept({
      method: 'GET',
      url: '/offenders/A12345/create-alert?typeCode=F1',
    }).as('getTypes')

    const createAlertPage = CreateAlertPage.verifyOnPage()
    const form = createAlertPage.form()
    form.alertType().select('F1')
    cy.wait('@getTypes').then(() => {
      cy.get('#alert-code').select('F1')
      form.comments().type('Test comment')
      form.submitButton().click()

      // TODO: This is clearly a broken flow - suspect create alert needs to be decommissioned now
      NoCaseloadsPage.verifyOnPage()
    })
  })

  it('Should show correct error messages', () => {
    const createAlertPage = CreateAlertPage.verifyOnPage()
    const form = createAlertPage.form()
    form.submitButton().click()

    CreateAlertPage.verifyOnPage()
    createAlertPage.errorSummaryTitle().contains('There is a problem')
    createAlertPage
      .errorSummaryList()
      .find('li')
      .then(($errors) => {
        expect($errors.get(0).innerText).to.contain('Select the type of alert')
        expect($errors.get(1).innerText).to.contain('Select the alert')
        expect($errors.get(2).innerText).to.contain('Enter why you are creating this alert')
      })
  })

  it('Should show correct message when offender already has this alert', () => {
    cy.intercept({
      method: 'GET',
      url: '/offenders/A12345/create-alert?typeCode=X',
    }).as('getTypes')

    const createAlertPage = CreateAlertPage.verifyOnPage()
    const form = createAlertPage.form()

    form.alertType().select('X')

    cy.wait('@getTypes').then(() => {
      cy.get('#alert-code').select('XC')
      form.comments().type('Test comment')
      form.submitButton().click()

      CreateAlertPage.verifyOnPage()
      createAlertPage.errorSummaryTitle().contains('There is a problem')
      createAlertPage
        .errorSummaryList()
        .find('li')
        .then(($errors) => {
          expect($errors.get(0).innerText).to.contain('Select an alert that does not already exist for this offender')
        })
    })
  })
})

context('when a user has no permissions ', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
    cy.signIn()
  })
  beforeEach(() => {
    const offenderNo = 'A12345'
    cy.task('stubOffenderFullDetails', offenderFullDetails)
    cy.task('stubAlertTypes')
    cy.task('stubCreateAlert')
    cy.task('stubUserCaseLoads')

    cy.visit(`/offenders/${offenderNo}/create-alert`)
  })
  it('A user is presented with not found when they no role', () => {
    cy.visit('/offenders/A12345/create-alert')
    NotFoundPage.verifyOnPage()
  })
})
