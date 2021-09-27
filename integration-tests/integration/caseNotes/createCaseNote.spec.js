const moment = require('moment')

const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const CreateCaseNotePage = require('../../pages/caseNotes/createCaseNotePage')
const CaseNoteConfirmPage = require('../../pages/caseNotes/caseNoteConfirmPage')
const PrisonerCaseNotePage = require('../../pages/prisonerProfile/caseNotePage')

context('A user can add a case note', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    const offenderNo = 'A12345'
    cy.task('stubCaseNoteTypesForUser')
    cy.task('stubCreateCaseNote')
    cy.task('stubVerifyToken')

    cy.visit(`/prisoner/${offenderNo}/add-case-note`)
  })
  afterEach(() => {
    cy.task('reset')
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

  it('A user can successfully add an OMiC open case note', () => {
    cy.task('stubClientCredentialsRequest')
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo: 'A12345',
    })
    cy.task('stubCaseNoteTypes')
    cy.task('stubCaseNotes', { totalElements: 1, content: [] })

    cy.server()
    cy.route({ method: 'GET', url: '/prisoner/A12345/add-case-note?typeCode=OMIC' }).as('getTypes')

    const createCaseNotePage = CreateCaseNotePage.verifyOnPage()
    const form = createCaseNotePage.form()
    form.type().select('OMIC')

    cy.wait('@getTypes')

    form.subType().select('OPEN_COMM')
    createCaseNotePage.omicOpenWarning().should('be.visible')
    createCaseNotePage.omicOpenHint().should('be.visible')
    form.text().type('Test comment')
    form.hours().clear().type('05')
    form.minutes().clear().type('10')
    form.submitButton().click()

    const caseNoteConfirmPage = CaseNoteConfirmPage.verifyOnPage()
    caseNoteConfirmPage.form().confirmRadio().check('Yes')
    caseNoteConfirmPage.form().submitButton().click()

    PrisonerCaseNotePage.verifyOnPage('Smith, John')

    cy.task('verifySaveCaseNote').should((requests) => {
      expect(requests).to.have.lengthOf(1)

      expect(JSON.parse(requests[0].body)).to.deep.equal({
        offenderNo: 'A12345',
        type: 'OMIC',
        subType: 'OPEN_COMM',
        text: 'Test comment',
        occurrenceDateTime: `${moment().format('YYYY-MM-DD')}T05:10:00`,
        date: moment().format('DD/MM/YYYY'),
        hours: '05',
        minutes: '10',
      })
    })
  })

  it('A user can add an OMiC open case note and opt to change it', () => {
    cy.task('stubClientCredentialsRequest')
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo: 'A12345',
    })
    cy.task('stubCaseNoteTypes')
    cy.task('stubCaseNotes', { totalElements: 1, content: [] })

    cy.server()
    cy.route({ method: 'GET', url: '/prisoner/A12345/add-case-note?typeCode=OMIC' }).as('getTypes')

    const createCaseNotePage = CreateCaseNotePage.verifyOnPage()
    const form = createCaseNotePage.form()
    form.type().select('OMIC')

    cy.wait('@getTypes')

    form.subType().select('OPEN_COMM')
    form.text().type('Test comment')
    form.submitButton().click()

    const caseNoteConfirmPage = CaseNoteConfirmPage.verifyOnPage()
    caseNoteConfirmPage.form().submitButton().click()
    CaseNoteConfirmPage.verifyOnPage()
    caseNoteConfirmPage.errorSummaryTitle().contains('There is a problem')
    caseNoteConfirmPage.errorSummaryList().contains('Select yes if this information is appropriate to share')

    caseNoteConfirmPage.form().confirmRadio().check('No')
    caseNoteConfirmPage.form().submitButton().click()

    const createCaseNotePage2 = CreateCaseNotePage.verifyOnPage()
    createCaseNotePage2.omicOpenWarning().should('be.visible')
    createCaseNotePage2.omicOpenHint().should('be.visible')
    const form2 = createCaseNotePage2.form()
    form2.type().should('have.value', 'OMIC')
    form2.subType().should('have.value', 'OPEN_COMM')
    form2.text().should('have.value', 'Test comment')
    form2.date().should('have.value', moment().format('DD/MM/YYYY'))
  })

  it('OMiC open case note warnings only valid for OMiC Open case note', () => {
    cy.task('stubClientCredentialsRequest')
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo: 'A12345',
    })
    cy.task('stubCaseNoteTypes')
    cy.task('stubCaseNotes', { totalElements: 1, content: [] })

    cy.server()
    cy.route({ method: 'GET', url: '/prisoner/A12345/add-case-note?typeCode=OMIC' }).as('getOmicTypes')
    cy.route({ method: 'GET', url: '/prisoner/A12345/add-case-note?typeCode=OBSERVE' }).as('getObserveTypes')

    const page = CreateCaseNotePage.verifyOnPage()
    const form = page.form()
    page.omicOpenWarning().should('not.be.visible')
    page.omicOpenHint().should('not.be.visible')
    form.type().select('OMIC')
    cy.wait('@getOmicTypes')

    form.subType().select('OPEN_COMM')
    page.omicOpenWarning().should('be.visible')
    page.omicOpenHint().should('be.visible')
    form.subType().select('COMM')
    page.omicOpenWarning().should('not.be.visible')
    page.omicOpenHint().should('not.be.visible')
    form.subType().select('OPEN_COMM')
    page.omicOpenWarning().should('be.visible')
    page.omicOpenHint().should('be.visible')
    form.type().select('OBSERVE')
    cy.wait('@getObserveTypes')

    page.omicOpenWarning().should('not.be.visible')
    page.omicOpenHint().should('not.be.visible')
  })

  it('Should show correct error messages', () => {
    const createCaseNotePage = CreateCaseNotePage.verifyOnPage()
    const form = createCaseNotePage.form()
    cy.get('form').click()
    form.hours().clear()
    form.minutes().clear()
    form.submitButton().click()

    CreateCaseNotePage.verifyOnPage()
    createCaseNotePage.errorSummaryTitle().contains('There is a problem')
    createCaseNotePage
      .errorSummaryList()
      .find('li')
      .then(($errors) => {
        expect($errors.get(0).innerText).to.contain('Select the case note type')
        expect($errors.get(1).innerText).to.contain('Select the case note sub-type')
        expect($errors.get(2).innerText).to.contain('Enter what happened')
        expect($errors.get(3).innerText).to.contain('Enter an hour which is 23 or less')
        expect($errors.get(4).innerText).to.contain('Enter the minutes using 59 or less')
      })
  })

  it('Should show OMiC open case note warning when error messages shown', () => {
    const page = CreateCaseNotePage.verifyOnPage()
    const form = page.form()
    cy.get('form').click()
    form.hours().clear()
    form.minutes().clear()

    cy.server()
    cy.route({ method: 'GET', url: '/prisoner/A12345/add-case-note?typeCode=OMIC' }).as('getOmicTypes')
    form.type().select('OMIC')
    cy.wait('@getOmicTypes')

    form.subType().select('OPEN_COMM')
    page.omicOpenWarning().should('be.visible')
    page.omicOpenHint().should('be.visible')

    form.submitButton().click()

    CreateCaseNotePage.verifyOnPage()
    page.errorSummaryTitle().contains('There is a problem')
    page
      .errorSummaryList()
      .find('li')
      .then(($errors) => {
        expect($errors.get(0).innerText).to.contain('Enter what happened')
        expect($errors.get(1).innerText).to.contain('Enter an hour which is 23 or less')
        expect($errors.get(2).innerText).to.contain('Enter the minutes using 59 or less')
      })

    page.omicOpenWarning().should('be.visible')
    page.omicOpenHint().should('be.visible')
  })
})
