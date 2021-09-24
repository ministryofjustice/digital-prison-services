const amendmentPage = require('../../pages/caseNotes/case-note-amendments-page')
const CaseNotesPage = require('../../pages/prisonerProfile/caseNotePage')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

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

context('Case note amendments', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.signIn()

    cy.task('stubBookingDetails', { firstName: 'Bob', lastName: 'Smith' })
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
    })

    const page = amendmentPage.verifyOnPage('Bob Smith')

    cy.task('stubSaveAmendment')

    page.omicOpenWarning().should('not.exist')
    page.omicOpenHint().should('not.exist')

    page.moreDetail().type('Hello, world!')
    page.save().click()

    CaseNotesPage.verifyOnPage('Smith, John')

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
    })

    const page = amendmentPage.verifyOnPage('Bob Smith')

    cy.task('stubSaveAmendment')

    page.omicOpenWarning().should('be.visible')
    page.omicOpenHint().should('be.visible')

    page.moreDetail().type('Hello, world!')
    page.save().click()

    CaseNotesPage.verifyOnPage('Smith, John')

    cy.task('verifySaveAmendment').should((requests) => {
      expect(requests).to.have.lengthOf(1)

      expect(JSON.parse(requests[0].body)).to.deep.equal({
        text: 'Hello, world!',
      })
    })
  })
})
