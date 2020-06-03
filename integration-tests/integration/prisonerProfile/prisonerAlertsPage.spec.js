const PrisonerAlertsPage = require('../../pages/prisonerProfile/prisonerAlertsPage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

context('A user can view alerts for a prisoner', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    // Maintain session between the two tests.
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    const iepSummary = {}
    const caseNoteSummary = {}
    cy.task('stubPrisonerProfileHeaderData', { offenderBasicDetails, offenderFullDetails, iepSummary, caseNoteSummary })
    cy.task('stubAlertTypes')
  })

  it('Users can view inactive alerts', () => {
    cy.task('stubAlertsForBooking', [
      {
        active: false,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'XC',
        alertCodeDescription: 'Risk to females',
        alertId: 1,
        alertType: 'X',
        alertTypeDescription: 'Security',
        bookingId: 14,
        comment: 'has a large poster on cell wall',
        dateCreated: '2019-08-20',
        dateExpires: null,
        expired: true,
        expiredByFirstName: 'John',
        expiredByLastName: 'Smith',
        offenderNo: 'G3878UK',
      },
    ])
    cy.visit('/prisoner/G3878UK/alerts')
    const prisonerAlertsPage = PrisonerAlertsPage.verifyOnPage('Smith, John')
    const filterForm = prisonerAlertsPage.getFilterForm()
    filterForm.activeFilter().select('INACTIVE')
    filterForm.applyButton().click()
    prisonerAlertsPage.tableTitle().contains('Inactive alerts')

    const inactiveTable = prisonerAlertsPage.getInactiveAlertsRows(0)
    inactiveTable.typeOfAlert().contains('Security (X)')
    inactiveTable.details().contains('Risk to females (XC)')
    inactiveTable.comments().contains('has a large poster on cell wall')
    inactiveTable.dateFromDateClosed().contains('20/08/2019')
    inactiveTable.createdByClosedBy().contains('Smith, John')
  })

  it('Users can view active alerts', () => {
    cy.task('stubAlertsForBooking', [
      {
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'XC',
        alertCodeDescription: 'Risk to females',
        alertId: 1,
        alertType: 'X',
        alertTypeDescription: 'Security',
        bookingId: 14,
        comment: 'has a large poster on cell wall',
        dateCreated: '2019-08-20',
        dateExpires: null,
        expired: false,
        expiredByFirstName: 'John',
        expiredByLastName: 'Smith',
        offenderNo: 'G3878UK',
      },
    ])
    cy.visit('/prisoner/G3878UK/alerts')
    const prisonerAlertsPage = PrisonerAlertsPage.verifyOnPage('Smith, John')
    const activeTable = prisonerAlertsPage.getActiveAlertsRows(0)

    prisonerAlertsPage.tableTitle().contains('Active alerts')
    activeTable.typeOfAlert().contains('Security (X)')
    activeTable.alert().contains('Risk to females (XC)')
    activeTable.comments().contains('has a large poster on cell wall')
    activeTable.dateFrom().contains('20/08/2019')
    activeTable.createdBy().contains('Smith, John')
    activeTable
      .editCreateButton()
      .find('a')
      .contains('Edit or close')
  })
})
