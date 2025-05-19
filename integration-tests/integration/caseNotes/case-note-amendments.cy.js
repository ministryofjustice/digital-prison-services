const amendmentPage = require('../../pages/caseNotes/case-note-amendments-page')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const CaseNoteConfirmPage = require('../../pages/caseNotes/caseNoteConfirmPage')
const noCaseloadsPage = require('../../pages/prisonerProfile/noCaseloads')

const keyWorkerCaseNote = {
  caseNoteId: 1,
  authorUserId: '12345',
  offenderIdentifier: 'A12345',
  type: 'KA',
  typeDescription: 'Key Worker',
  subType: 'KS',
  subTypeDescription: 'Key Worker Session',
  source: 'INST',
  text: 'This is some text',
  amendments: [
    {
      additionalNoteText: 'This is an amendment',
    },
    {
      additionalNoteText: 'This is an amendment',
    },
  ],
}
const omicOpenCaseNote = {
  ...keyWorkerCaseNote,
  type: 'OMIC',
  typeDescription: 'OMiC',
  subType: 'OPEN_COMM',
  subTypeDescription: 'Open Case Note',
}

const setupAmendmentPage = () => {
  const offenderBasicDetails = { bookingId: 14, firstName: 'Bob', lastName: 'Smith' }

  cy.task('stubOffenderBasicDetails', offenderBasicDetails)
  cy.task('stubCaseNoteTypesForUser')
  cy.task('stubCaseNoteTypes')

  cy.task('stubCaseNotes', {
    totalElements: 0,
    content: [],
  })

  cy.task('stubPrisonerProfileHeaderData', {
    offenderBasicDetails,
    offenderFullDetails,
    iepSummary: {},
    caseNoteSummary: {},
    offenderNo: 'A12345',
    caseloads: [],
  })
}

context('Case note amendments', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
    cy.signIn()

    cy.task('stubBookingDetails', { firstName: 'Bob', lastName: 'Smith', agencyId: 'MDI' })
  })

  it('should play back correct information on page load', () => {
    cy.task('stubGetCaseNote', keyWorkerCaseNote)
    cy.visit('/prisoner/A12345/case-notes/amend-case-note/1')

    const page = amendmentPage.verifyOnPage('Bob Smith')

    page.prisonNumber().contains('A12345')
    page.typeSubType().contains('Key worker: Key worker session')

    page
      .amendments()
      .find('pre')
      .then(($element) => {
        expect($element.get(0).innerText.trim()).to.eq('This is an amendment')
      })
  })

  it('should save an amendment', () => {
    cy.task('stubGetCaseNote', keyWorkerCaseNote)
    cy.visit('/prisoner/A12345/case-notes/amend-case-note/1')

    setupAmendmentPage()

    const page = amendmentPage.verifyOnPage('Bob Smith')

    cy.task('stubSaveAmendment')

    page.omicOpenWarning().should('not.exist')
    page.omicOpenHint().should('not.exist')

    page.moreDetail().type('Hello, world!')
    page.save().click()

    // Weirdly a user can create the case note but can't access the case note page...
    noCaseloadsPage.verifyOnPage()

    cy.task('verifySaveAmendment').should((requests) => {
      expect(requests).to.have.lengthOf(1)

      expect(JSON.parse(requests[0].body)).to.deep.equal({
        text: 'Hello, world!',
      })
    })
  })

  it('should save an OMiC open case note amendment', () => {
    cy.task('stubGetCaseNote', omicOpenCaseNote)
    cy.visit('/prisoner/A12345/case-notes/amend-case-note/1')

    setupAmendmentPage()

    const page = amendmentPage.verifyOnPage('Bob Smith')

    cy.task('stubSaveAmendment')

    page.omicOpenWarning().should('be.visible')
    page.omicOpenHint().should('be.visible')

    page.moreDetail().type('Hello, world!')
    page.save().click()

    const caseNoteConfirmPage = CaseNoteConfirmPage.verifyOnPage()
    caseNoteConfirmPage.form().confirmRadio().check('Yes')
    caseNoteConfirmPage.form().submitButton().click()

    // Weirdly a user can create the case note but can't access the case note page...
    noCaseloadsPage.verifyOnPage()

    cy.task('verifySaveAmendment').should((requests) => {
      expect(requests).to.have.lengthOf(1)

      expect(JSON.parse(requests[0].body)).to.deep.equal({
        text: 'Hello, world!',
      })
    })
  })

  it('should write an OMiC open case note amendment and opt to change it', () => {
    cy.task('stubGetCaseNote', omicOpenCaseNote)
    cy.visit('/prisoner/A12345/case-notes/amend-case-note/1')

    setupAmendmentPage()

    const page = amendmentPage.verifyOnPage('Bob Smith')

    page.omicOpenWarning().should('be.visible')
    page.omicOpenHint().should('be.visible')

    page.moreDetail().type('Hello, world!')
    page.save().click()

    const caseNoteConfirmPage = CaseNoteConfirmPage.verifyOnPage()
    caseNoteConfirmPage.form().submitButton().click()
    CaseNoteConfirmPage.verifyOnPage()
    caseNoteConfirmPage.errorSummaryTitle().contains('There is a problem')
    caseNoteConfirmPage.errorSummaryList().contains('Select yes if this information is appropriate to share')

    caseNoteConfirmPage.form().confirmRadio().check('No')
    caseNoteConfirmPage.form().submitButton().click()

    const page2 = amendmentPage.verifyOnPage('Bob Smith')
    page2.omicOpenWarning().should('be.visible')
    page2.omicOpenHint().should('be.visible')
    page2.moreDetail().should('have.value', 'Hello, world!')
  })

  it('should show OMiC open case note warnings when error messages shown', () => {
    cy.task('stubGetCaseNote', omicOpenCaseNote)
    cy.visit('/prisoner/A12345/case-notes/amend-case-note/1')

    setupAmendmentPage()

    const page = amendmentPage.verifyOnPage('Bob Smith')

    page.omicOpenWarning().should('be.visible')
    page.omicOpenHint().should('be.visible')

    page.save().click()

    const page2 = amendmentPage.verifyOnPage('Bob Smith')
    page2.errorSummaryTitle().contains('There is a problem')
    page2.errorSummaryList().contains('Enter more details to case note')
    page2.omicOpenWarning().should('be.visible')
    page2.omicOpenHint().should('be.visible')
  })
})
