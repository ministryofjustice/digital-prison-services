const PrisonerAlertsPage = require('../../pages/prisonerProfile/prisonerAlertsPage')

context('A user can view alerts for a prisoner', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
    const offenderBasicDetails = { bookingId: 14, firstName: 'John', lastName: 'Smith' }
    const offenderFullDetails = {
      bookingId: 14,
      firstName: 'John',
      lastName: 'Smith',
      offenderNo: 'G3878UK',
      alerts: [
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
          comment: 'has a small poster on cell wall',
          dateCreated: '2019-08-20',
          dateExpires: '2019-12-20',
          expired: true,
          expiredByFirstName: 'Jane',
          expiredByLastName: 'Smith',
          offenderNo: 'G3878UK',
        },
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
          comment: 'silly',
          dateCreated: '2019-08-25',
          dateExpires: '2019-09-20',
          expired: true,
          expiredByFirstName: 'Jane',
          expiredByLastName: 'Smith',
          offenderNo: 'G3878UK',
        },
      ],
      assignedLivingUnit: {
        agencyId: 'MDI',
        agencyName: 'HMP Moorland',
        description: 'HMP Moorland',
        locationId: 12,
      },
    }
    const iepSummary = {}
    const caseNoteSummary = {}
    cy.task('stubPrisonerProfileHeaderData', { offenderBasicDetails, offenderFullDetails, iepSummary, caseNoteSummary })
    cy.task('stubAlertTypes')
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
    cy.visit('/prisoner/A12345/alerts')
  })

  it('User views active alerts by default', () => {
    const prisonerAlertsPage = PrisonerAlertsPage.verifyOnPage('Smith, John')
    prisonerAlertsPage.tableTitle().contains('Active alerts')
  })
})
