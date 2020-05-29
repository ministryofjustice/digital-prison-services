const CaseNotesPage = require('../../pages/prisonerProfile/caseNotePage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

const caseNotes = [
  {
    caseNoteId: 12311312,
    offenderIdentifier: 'A1234AA',
    type: 'KA',
    typeDescription: 'Key Worker',
    subType: 'KS',
    subTypeDescription: 'Key Worker Session',
    source: 'INST',
    creationDateTime: '2017-10-31T01:30:00',
    occurrenceDateTime: '2017-10-31T01:30:00',
    authorName: 'John Smith',
    authorUserId: 12345,
    text: 'This is some text',
    locationId: 'MDI',
    amendments: [
      {
        caseNoteAmendmentId: 123232,
        sequence: 1,
        creationDateTime: '2018-12-01T13:45:00',
        authorUserName: 'USER1',
        authorName: 'Mickey Mouse',
        additionalNoteText: 'Some Additional Text',
        authorUserId: 12345,
      },
    ],
    eventId: -23,
  },
]

context('A user can view prisoner case notes', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()
    cy.task('stubCaseNoteTypes')

    cy.task('stubCaseNotes', {
      totalElements: 1,
      content: caseNotes,
    })

    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
    })

    const offenderNo = 'A12345'
    cy.visit(`/prisoner/${offenderNo}/case-notes?pageOffsetOption=0`)
  })

  it('A user can view a prisoners case notes', () => {
    const page = CaseNotesPage.verifyOnPage('Smith, John')
    const tableDataRow = page.getRows(0)

    tableDataRow.createdBy().contains('Tuesday 31/10/2017 01:30 John Smith')
    tableDataRow
      .caseNoteDetails()
      .contains('Key Worker: Key Worker Session This is some text Happened: 31/10/2017 - 01:30')
  })
})
