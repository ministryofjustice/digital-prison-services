const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const CreateCaseNotePage = require('../../pages/caseNotes/createCaseNotePage')
const PrisonerCaseNotePage = require('../../pages/prisonerProfile/caseNotePage')

context('A user can add a case note', () => {
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
    const offenderNo = 'A12345'
    cy.task('stubCaseNoteTypesForUser')
    cy.task('stubCreateCaseNote')

    cy.visit(`/prisoner/${offenderNo}/add-case-note`)
  })

  it('A user can successfully add a case note', () => {
    cy.task('stubClientCredentialsRequest')
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
    })
    cy.task('stubCaseNoteTypes')
    cy.task('stubCaseNotes', {
      totalElements: 1,
      content: [],
    })
    const createCaseNotePage = CreateCaseNotePage.verifyOnPage()
    const form = createCaseNotePage.form()
    form.type().select('OBSERVE')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(50)
    cy.get('#sub-type').select('test')
    form.text().type('Test comment')
    form.submitButton().click()
    PrisonerCaseNotePage.verifyOnPage('Smith, John')
  })

  it('Should show correct error messages', () => {
    const createCaseNotePage = CreateCaseNotePage.verifyOnPage()
    const form = createCaseNotePage.form()
    form.submitButton().click()

    CreateCaseNotePage.verifyOnPage()
    createCaseNotePage.errorSummaryTitle().contains('There is a problem')
    createCaseNotePage
      .errorSummaryList()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select the case note type')
        expect($errors.get(1).innerText).to.contain('Select the case note sub-type')
        expect($errors.get(2).innerText).to.contain('Enter what happened')
      })
  })
})
