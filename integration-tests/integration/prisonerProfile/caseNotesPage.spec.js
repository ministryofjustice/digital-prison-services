const CaseNotesPage = require('../../pages/prisonerProfile/caseNotePage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

const caseNotes = [
  {
    caseNoteId: 12311312,
    offenderIdentifier: 'A1234AA',
    type: 'IEP',
    typeDescription: 'Incentive Level',
    subType: 'IEP_WARN',
    subTypeDescription: 'Incentive Level Warning',
    source: 'INST',
    creationDateTime: '2017-10-31T01:30:00',
    occurrenceDateTime: '2017-10-31T01:30:00',
    authorName: 'Mouse, Mickey',
    authorUserId: '12345',
    text: 'This is some text',
    locationId: 'MDI',
    amendments: [
      {
        caseNoteAmendmentId: 123232,
        sequence: 1,
        creationDateTime: '2018-12-01T13:45:00',
        authorUserName: 'USER1',
        authorName: 'Mouse, Mickey',
        additionalNoteText: 'Some Additional Text',
        authorUserId: 12345,
      },
    ],
    eventId: -23,
  },
]

context('A user can view prisoner case notes', () => {
  before(() => {
    cy.clearCookies()
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
    cy.stub(window, 'print')
    cy.visit(`/prisoner/${offenderNo}/case-notes?pageOffsetOption=0`)
  })

  it('A user can view a prisoners case notes', () => {
    const page = CaseNotesPage.verifyOnPage('Smith, John')
    const tableDataRow = page.getRows(0)

    tableDataRow.createdBy().contains('Tuesday 31/10/2017 01:30 Mickey Mouse')
    tableDataRow
      .caseNoteDetails()
      .contains(
        'Incentive Level: Incentive Level Warning This is some text Add more details Happened: 31/10/2017 - 01:30'
      )
    tableDataRow
      .caseNoteAddMoreDetailsLink()
      .contains('Add more details')
      .should('have.attr', 'href', 'http://localhost:20200/offenders/A12345/case-notes/12311312/amend-case-note')
    tableDataRow
      .caseNotePrintIncentiveLevelSlipLink()
      .contains('Print Incentive Level Slip')
      .should(
        'have.attr',
        'href',
        '/iep-slip?offenderNo=A12345&offenderName=Smith%2C%20John&location=HMP%20Moorland&casenoteId=12311312&issuedBy=undefined'
      )
  })
})
