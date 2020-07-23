const CaseNotesPage = require('../../pages/prisonerProfile/caseNotePage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

const offenderNo = 'A12345'
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
  })

  it('A user can view a prisoners case notes', () => {
    cy.visit(`/prisoner/${offenderNo}/case-notes?pageOffsetOption=0`)
    const page = CaseNotesPage.verifyOnPage('Smith, John')
    page.noDataMessage().should('not.be.visible')
    const rows = page.getRows(0)

    rows
      .createdBy()
      .find('span')
      .then($element => {
        expect($element.get(0).innerText.trim()).to.eq('Tuesday')
        expect($element.get(1).innerText.trim()).to.eq('31 October 2017')
        expect($element.get(2).innerText.trim()).to.eq('01:30')
        expect($element.get(3).innerText.trim()).to.eq('Mickey Mouse')
      })

    rows
      .caseNoteDetails()
      .find('h3')
      .then($element => {
        expect($element.get(0).innerText.trim()).to.eq('Incentive Level: Incentive Level Warning')
      })

    rows
      .caseNoteDetails()
      .find('p')
      .then($element => {
        expect($element.get(0).innerText.trim()).to.eq('This is some text')
      })

    rows
      .caseNoteAddMoreDetailsLink()
      .contains('Add more details')
      .should('have.attr', 'href', 'http://localhost:20200/offenders/A12345/case-notes/12311312/amend-case-note')

    rows
      .caseNotePrintIncentiveLevelSlipLink()
      .contains('Print Incentive Level Slip')
      .should(
        'have.attr',
        'href',
        '/iep-slip?offenderNo=A12345&offenderName=Smith%2C%20John&location=HMP%20Moorland&casenoteId=12311312&issuedBy=undefined'
      )

    const form = page.filterForm()

    form.typeSelect().select('Observations')

    form
      .subTypeSelect()
      .get('option')
      .should('contain', 'Test')

    form.subTypeSelect().select('Test')
    form.applyButton().click()

    form.subTypeSelect().select('Select')
    form.applyButton().click()
    CaseNotesPage.verifyOnPage('Smith, John')
  })

  it('A user see the no case notes message when there are no results', () => {
    cy.task('stubCaseNotes', {
      totalElements: 0,
      content: [],
    })
    cy.visit(`/prisoner/${offenderNo}/case-notes?pageOffsetOption=0`)
    const page = CaseNotesPage.verifyOnPage('Smith, John')
    page.noDataMessage().should('be.visible')
  })
})
