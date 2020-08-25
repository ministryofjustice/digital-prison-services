const moment = require('moment')

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
      offenderNo: 'A12345',
    })
    cy.task('stubCaseNoteTypes')
    cy.task('stubCaseNotes', {
      totalElements: 1,
      content: [],
    })

    cy.server()

    cy.route({
      method: 'GET',
      url: '/prisoner/A12345/add-case-note?typeCode=OBSERVE',
    }).as('getTypes')

    const createCaseNotePage = CreateCaseNotePage.verifyOnPage()
    const form = createCaseNotePage.form()
    form.type().select('OBSERVE')

    cy.wait('@getTypes').then(() => {
      cy.get('#sub-type').select('test')
      form.text().type('Test comment')
      form.submitButton().click()
      PrisonerCaseNotePage.verifyOnPage('Smith, John')
    })
  })

  it('Should show correct error messages', () => {
    const createCaseNotePage = CreateCaseNotePage.verifyOnPage()
    const form = createCaseNotePage.form()
    form.date().clear()
    cy.get('form').click()
    form.hours().clear()
    form.minutes().clear()
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
        expect($errors.get(3).innerText).to.contain('Select the date when this happened')
        expect($errors.get(4).innerText).to.contain('Enter an hour which is 23 or less')
        expect($errors.get(5).innerText).to.contain('Enter the minutes using 59 or less')
      })
  })
})
