const CaseNotesPage = require('../../pages/prisonerProfile/caseNotePage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

const offenderNo = 'A12345'
const caseNote = {
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
}

const replicate = ({ data, times }) =>
  Array(times)
    .fill()
    .map(() => data)

context('A user can view prisoner case notes', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()
    cy.task('stubCaseNoteTypes')

    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo,
    })
  })

  it('A user can view a prisoners case notes', () => {
    cy.task('stubCaseNotes', {
      totalElements: 21,
      content: replicate({ data: caseNote, times: 21 }),
    })
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
      .find('pre')
      .then($element => {
        expect($element.get(0).innerText.trim()).to.eq('This is some text')
        expect($element.get(1).innerText.trim()).to.eq('Some Additional Text')
      })

    rows
      .caseNoteDetails()
      .find('p')
      .then($element => {
        expect($element.get(0).innerText.trim()).to.eq('More details added:')
      })

    rows
      .caseNoteAddMoreDetailsLink()
      .contains('Add more details')
      .should('have.attr', 'href', '/prisoner/A12345/case-notes/amend-case-note/12311312')

    rows
      .caseNotePrintIncentiveLevelSlipLink()
      .contains('Print Incentive Level slip')
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

  it('should request all case notes when "View all case notes" top link has been clicked', () => {
    cy.task('stubCaseNotes', {
      totalElements: 21,
      content: replicate({ data: caseNote, times: 21 }),
    })
    cy.visit(`/prisoner/${offenderNo}/case-notes`)
    const page = CaseNotesPage.verifyOnPage('Smith, John')

    page.viewAllCaseNotesTopLink().click()

    cy.url().should('eq', 'http://localhost:3008/prisoner/A12345/case-notes?showAll=true')
  })

  it('should request all case notes when "View all case notes" bottom link has been clicked', () => {
    cy.task('stubCaseNotes', {
      totalElements: 21,
      content: replicate({ data: caseNote, times: 21 }),
    })
    cy.visit(`/prisoner/${offenderNo}/case-notes`)
    const page = CaseNotesPage.verifyOnPage('Smith, John')

    page.viewAllCaseNotesBottomLink().click()

    cy.url().should('eq', 'http://localhost:3008/prisoner/A12345/case-notes?showAll=true')
  })

  it('should not show links if the results are less than 20', () => {
    cy.task('stubCaseNotes', {
      totalElements: 1,
      content: [caseNote],
    })
    cy.visit(`/prisoner/${offenderNo}/case-notes`)
    const page = CaseNotesPage.verifyOnPage('Smith, John')

    page.viewAllCaseNotesTopLink().should('not.exist')
    page.viewAllCaseNotesBottomLink().should('not.exist')
  })

  it('should repopulate input fields with selected filters once applied has been clicked', () => {
    cy.server()
    cy.route({
      method: 'GET',
      url: '/prisoner/A12345/case-notes?typeCode=OBSERVE',
    }).as('getSubTypes')

    cy.task('stubCaseNotes', {
      totalElements: 21,
      content: replicate({ data: caseNote, times: 21 }),
    })
    cy.visit(`/prisoner/${offenderNo}/case-notes`)

    const page = CaseNotesPage.verifyOnPage('Smith, John')

    page
      .filterForm()
      .typeSelect()
      .select('Observations')

    cy.wait('@getSubTypes').then(() => {
      page
        .filterForm()
        .subTypeSelect()
        .select('Test')
      page
        .filterForm()
        .fromDate()
        .type('02/02/2020')
      page
        .filterForm()
        .toDate()
        .type('02/01/2020')
      page
        .filterForm()
        .applyButton()
        .click()

      CaseNotesPage.verifyOnPage('Smith, John')

      page
        .filterForm()
        .typeSelect()
        .should('have.value', 'OBSERVE')
      page
        .filterForm()
        .subTypeSelect()
        .should('have.value', 'test')
      page
        .filterForm()
        .fromDate()
        .should('have.value', '02/02/2020')
      page
        .filterForm()
        .toDate()
        .should('have.value', '02/01/2020')
    })
  })

  it('should remember filters when viewing all case notes', () => {
    cy.server()
    cy.route({
      method: 'GET',
      url: '/prisoner/A12345/case-notes?typeCode=OBSERVE',
    }).as('getSubTypes')

    cy.task('stubCaseNotes', {
      totalElements: 21,
      content: replicate({ data: caseNote, times: 21 }),
    })
    cy.visit(`/prisoner/${offenderNo}/case-notes`)

    const page = CaseNotesPage.verifyOnPage('Smith, John')

    page
      .filterForm()
      .typeSelect()
      .select('Observations')

    const fillOutForm = () => {
      page
        .filterForm()
        .subTypeSelect()
        .select('Test')
      page
        .filterForm()
        .fromDate()
        .type('02/02/2020')
      page
        .filterForm()
        .toDate()
        .type('02/01/2020')
      page
        .filterForm()
        .applyButton()
        .click()
    }

    cy.wait('@getSubTypes').then(() => {
      fillOutForm()

      CaseNotesPage.verifyOnPage('Smith, John')

      page.viewAllCaseNotesBottomLink().click()

      CaseNotesPage.verifyOnPage('Smith, John')

      cy.url().should(
        'eq',
        'http://localhost:3008/prisoner/A12345/case-notes?showAll=true&pageOffsetOption=0&type=OBSERVE&subType=test&fromDate=02%2F02%2F2020&toDate=02%2F01%2F2020'
      )

      cy.visit(`/prisoner/${offenderNo}/case-notes`)

      CaseNotesPage.verifyOnPage('Smith, John')

      page
        .filterForm()
        .typeSelect()
        .select('Observations')

      cy.wait('@getSubTypes').then(() => {
        fillOutForm()

        CaseNotesPage.verifyOnPage('Smith, John')

        page.viewAllCaseNotesTopLink().click()

        CaseNotesPage.verifyOnPage('Smith, John')

        cy.url().should(
          'eq',
          'http://localhost:3008/prisoner/A12345/case-notes?showAll=true&pageOffsetOption=0&type=OBSERVE&subType=test&fromDate=02%2F02%2F2020&toDate=02%2F01%2F2020'
        )
      })
    })
  })

  it('should remove the view all case notes link once clicked', () => {
    cy.task('stubCaseNotes', {
      totalElements: 21,
      content: replicate({ data: caseNote, times: 21 }),
    })
    cy.visit(`/prisoner/${offenderNo}/case-notes`)

    const page = CaseNotesPage.verifyOnPage('Smith, John')

    page.viewAllCaseNotesTopLink().should('exist')
    page.viewAllCaseNotesBottomLink().should('exist')

    page.viewAllCaseNotesTopLink().click()

    CaseNotesPage.verifyOnPage('Smith, John')

    page.viewAllCaseNotesTopLink().should('not.exist')
    page.viewAllCaseNotesBottomLink().should('not.exist')
  })
})
