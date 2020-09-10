const MoveValidationPage = require('../../pages/cellMove/moveValidationPage')

const offenderNo = 'A1234A'

context('A user can see conflicts in cell', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubPrisonerFullDetail', {
      prisonerDetail: {
        bookingId: 1234,
        firstName: 'Test',
        lastName: 'User',
        csra: 'High',
        agencyId: 'MDI',
        assessments: [],
        assignedLivingUnit: {},
        alerts: [
          {
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
            alertCode: 'RLG',
            alertCodeDescription: 'Risk to LGB',
            alertId: 1,
            alertType: 'X',
            alertTypeDescription: 'Risk to LGB',
            bookingId: 14,
            comment: 'has a large poster on cell wall',
            dateCreated: '2019-08-20',
            dateExpires: null,
            expired: false,
            expiredByFirstName: 'John',
            expiredByLastName: 'Smith',
            offenderNo,
          },
          {
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
            alertCode: 'XGANG',
            alertCodeDescription: 'Gang member',
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
            offenderNo,
          },
          {
            alertId: 3,
            alertType: 'V',
            alertTypeDescription: 'Vulnerability',
            alertCode: 'VIP',
            alertCodeDescription: 'Isolated Prisoner',
            comment: 'test',
            dateCreated: '2020-08-20',
            expired: false,
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
          },
        ],
        profileInformation: [],
      },
      offenderNo,
    })
    cy.task('stubPrisonerFullDetail', {
      prisonerDetail: {
        bookingId: 1235,
        firstName: 'Occupant',
        lastName: 'User',
        csra: 'High',
        agencyId: 'MDI',
        offenderNo: 'A12346',
        assessments: [],
        assignedLivingUnit: {},
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
            offenderNo,
          },
          {
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
            alertCode: 'XGANG',
            alertCodeDescription: 'Gang member',
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
            offenderNo,
          },
          {
            alertId: 3,
            alertType: 'V',
            alertTypeDescription: 'Vulnerability',
            alertCode: 'VIP',
            alertCodeDescription: 'Isolated Prisoner',
            comment: 'test',
            dateCreated: '2020-08-20',
            expired: false,
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
          },
        ],
        profileInformation: [{ type: 'SEXO', resultValue: 'Homosexual' }],
      },
      offenderNo: 'A12345',
    })
    cy.task('stubInmatesAtLocation', {
      inmates: [{ offenderNo: 'A12345', firstName: 'Bob', lastName: 'Doe', assignedLivingUnitId: 1 }],
    })
    cy.task('stubBookingNonAssociations', {
      offenderNo,
      firstName: 'JOHN',
      lastName: 'SAUNDERS',
      agencyDescription: 'MOORLAND (HMP & YOI)',
      assignedLivingUnitDescription: 'MDI-1-1-015',
      nonAssociations: [
        {
          reasonCode: 'RIV',
          reasonDescription: 'Rival Gang',
          typeCode: 'LAND',
          typeDescription: 'Do Not Locate on Same Landing',
          effectiveDate: '2020-06-17T00:00:00',
          expiryDate: '2020-07-17T00:00:00',
          comments: 'Gang violence',
          offenderNonAssociation: {
            offenderNo: 'A12345',
            firstName: 'bob1',
            lastName: 'doe1',
            reasonCode: 'RIV',
            reasonDescription: 'Rival Gang',
            agencyDescription: 'MOORLAND (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-1-3-026',
          },
        },
      ],
    })
    cy.task('stubLocation', { locationId: 1, locationData: { parentLocationId: 2 } })
    cy.task('stubLocation', { locationId: 2, locationData: { parentLocationId: 3 } })
    cy.task('stubLocation', { locationId: 3, locationData: { locationPrefix: 'MDI-1' } })
  })

  it('should load with correct data', () => {
    const page = MoveValidationPage.goTo(offenderNo, 1)
    page.nonAssociationsTitle().contains('Test User has non-associations')
    page.nonAssociationsSubTitle().contains('There is a non-association with a prisoner in this location')
    page.csraTitle().contains('You must consider the CSRA of the prisoners involved')
    page.csraSubTitle().contains('You are moving a prisoner:')
    page.csraMessage().contains('who is CSRA high into a cell with a prisoner who is CSRA high')
    page.alertsTitle().contains('You must consider the risks of the prisoners involved')
    page.alertsSubTitle().contains('You are moving a prisoner:')
  })
})
