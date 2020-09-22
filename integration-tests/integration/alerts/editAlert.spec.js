const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const EditAlertPage = require('../../pages/alerts/editAlertPage')
const PrisonerAlertsPage = require('../../pages/prisonerProfile/prisonerAlertsPage')
const NotFoundPage = require('../../pages/notFound')

const offenderNo = 'A12345'
const alertId = 1

context('A user can add an appointment', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubOffenderFullDetails', offenderFullDetails)
    cy.task('stubAlertTypes')
    cy.task('stubCreateAlert')
    cy.task('stubUserMeRoles', [{ roleCode: 'UPDATE_ALERT' }])
    cy.task('stubUserMe')
    cy.task('stubUserCaseLoads')
    cy.task('stubGetAlert', { bookingId: 14, alertId, alert: { alertId: 1, comment: 'Test comment' } })
    cy.task('stubPutAlert', { bookingId: 14, alertId, alert: { alertId: 1, comment: 'Test comment' } })
  })

  it('A user can successfully edit an alert', () => {
    cy.visit(`/edit-alert?offenderNo=${offenderNo}&alertId=${alertId}`)
    const editAlertPage = EditAlertPage.verifyOnPage()
    const form = editAlertPage.form()
    form.comments().type('Test')
    form.alertStatusNo().click()
    form.submitButton().click()
    cy.url().should('include', `prisoner/${offenderNo}/alerts`)
  })

  it('Should show correct error messages', () => {
    cy.visit(`/edit-alert?offenderNo=${offenderNo}&alertId=${alertId}`)
    const editAlertPage = EditAlertPage.verifyOnPage()
    const form = editAlertPage.form()
    form.submitButton().click()

    EditAlertPage.verifyOnPage()
    editAlertPage
      .errorSummaryList()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select yes if you want to close this alert')
      })
  })

  it('A user is presented with not found when they no role', () => {
    cy.task('stubUserMeRoles', [])
    cy.visit(`/edit-alert?offenderNo=${offenderNo}&alertId=${alertId}`)
    NotFoundPage.verifyOnPage()
  })
})
