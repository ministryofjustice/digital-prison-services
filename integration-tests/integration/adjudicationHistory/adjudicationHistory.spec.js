const adjudicationsPage = require('../../pages/adjudicationHistory/adjudicationHistoryPage')

const { assertHasRequestCount } = require('../assertions')

const offenderNo = 'A12345'
const offenderName = `Bob Doe’s`

const responseHeaders = {
  'page-offset': '0',
  'page-limit': '10',
  'total-records': '10',
}

const adjudicationResponse = {
  agencies: [
    {
      active: true,
      agencyId: 'MDI',
      agencyType: 'INST',
      description: 'Moorland (HMP & YOI)',
    },
  ],
  offences: [
    {
      code: '51:7',
      description: 'Escapes or absconds from prison or from legal custody',
      id: 8,
    },
  ],
  results: [
    {
      adjudicationCharges: [
        {
          findingCode: 'PROVED',
          offenceCode: '51:22',
          offenceDescription: 'Disobeys any lawful order',
          oicChargeId: '1506763/1',
        },
      ],
      adjudicationNumber: 1234567,
      agencyId: 'MDI',
      agencyIncidentId: 1484302,
      partySeq: 1,
      reportTime: '2017-03-17T08:02:00',
    },
  ],
}
context('A user can confirm the cell move', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubBookingDetails', {
      firstName: 'Bob',
      lastName: 'Doe',
      offenderNo,
      bookingId: 1234,
    })
    cy.task('stubAdjudicationFindingTypes', [{ code: 'T1', description: 'type 1' }])
    cy.task('stubAdjudications', { response: adjudicationResponse, headers: responseHeaders })
  })

  it('should render the page', () => {
    const page = adjudicationsPage.goTo(offenderNo, offenderName)

    page
      .tableRows()
      .find('td')
      .then($columns => {
        expect($columns[0].innerText).to.equal('1234567')
        expect($columns[0].innerHTML).to.equal(
          '<a href="/prisoner/A12345/adjudications/1234567" class="govuk-link"> 1234567 </a>'
        )
        expect($columns[1].innerText).to.equal('17/03/2017 08:02')
        expect($columns[2].innerText).to.equal('Moorland (HMP & YOI)')
        expect($columns[3].innerText).to.equal('Disobeys any lawful order')
        expect($columns[4].innerText).to.equal('Not entered')
      })
  })

  it('should make a request with the correct filters supplied by the form', () => {
    const page = adjudicationsPage.goTo(offenderNo, offenderName)

    page
      .form()
      .establishment()
      .select('MDI')
    page
      .form()
      .finding()
      .select('type 1')

    page
      .form()
      .fromDate()
      .type('01/08/2020')
      .type('{esc}')

    page
      .form()
      .toDate()
      .type('05/08/2020')
      .type('{esc}')

    page
      .form()
      .applyFilters()
      .click()

    page.checkStillOnPage()

    cy.task('verifyAdjudicationsHistory', {
      offenderNo,
      agencyId: 'MDI',
      finding: 'T1',
      fromDate: '2020-08-01',
      toDate: '2020-08-05',
    }).then(assertHasRequestCount(1))
  })

  it('should show no adjudications found message with date range left blank', () => {
    cy.task('resetAdjudicationsStub')
    cy.task('stubAdjudications', {
      response: {
        ...adjudicationResponse,
        results: [],
      },
    })

    const page = adjudicationsPage.goTo(offenderNo, offenderName)

    page.noRecordsFoundMessage().contains('Bob Doe has had no adjudications')
  })

  it('should show no adjudications found message for date range', () => {
    cy.task('resetAdjudicationsStub')
    cy.task('stubAdjudications', {
      response: {
        ...adjudicationResponse,
        results: [],
      },
    })

    const page = adjudicationsPage.goTo(offenderNo, offenderName)

    page
      .form()
      .fromDate()
      .type('01/08/2020')
      .type('{esc}')

    page
      .form()
      .toDate()
      .type('05/08/2020')
      .type('{esc}')

    page
      .form()
      .applyFilters()
      .click()

    page.checkStillOnPage()

    page.noRecordsFoundMessage().contains('There are no adjudications for the selections you have made')
  })
})
