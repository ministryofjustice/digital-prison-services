const MoveValidationPage = require('../../pages/cellMove/moveValidationPage')
const ConfirmCellMovePage = require('../../pages/cellMove/confirmCellMovePage')

const offenderNo = 'A1234A'

context('A user can see conflicts in cell', () => {
  const stubPrisonDetails = () => {
    cy.task('stubPrisonerFullDetail', {
      prisonerDetail: {
        bookingId: 1234,
        firstName: 'Test',
        lastName: 'User',
        csra: 'High',
        agencyId: 'MDI',
        categoryCode: 'A',
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
            alertCode: 'XEL',
            alertCodeDescription: 'E-List',
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
  }
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
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
    cy.task('stubLocation', { locationId: 1, locationData: { parentLocationId: 2, description: 'MDI-1-1' } })
    cy.task('stubLocation', { locationId: 2, locationData: { parentLocationId: 3 } })
    cy.task('stubLocation', { locationId: 3, locationData: { locationPrefix: 'MDI-1' } })
  })

  it('should load with correct data', () => {
    stubPrisonDetails()
    const page = MoveValidationPage.goTo(offenderNo, 1)
    page.nonAssociationsTitle().contains('Test User has non-associations')
    page.nonAssociationsSubTitle().contains('There is a non-association with a prisoner in this location')
    page.nonAssociationsSummary().then($summary => {
      cy.get($summary)
        .find('dt')
        .then($summaryLabels => {
          cy.get($summaryLabels)
            .its('length')
            .should('eq', 6)
          expect($summaryLabels.get(0).innerText).to.contain('Name')
          expect($summaryLabels.get(1).innerText).to.contain('Prison number')
          expect($summaryLabels.get(2).innerText).to.contain('Location')
          expect($summaryLabels.get(3).innerText).to.contain('Type')
          expect($summaryLabels.get(4).innerText).to.contain('Reason')
          expect($summaryLabels.get(5).innerText).to.contain('Comment')
        })

      cy.get($summary)
        .find('dd')
        .then($summaryContent => {
          cy.get($summaryContent)
            .its('length')
            .should('eq', 6)
          expect($summaryContent.get(0).innerText).to.contain('Doe1, Bob1')
          expect($summaryContent.get(1).innerText).to.contain('A12345')
          expect($summaryContent.get(2).innerText).to.contain('MDI-1-3-026')
          expect($summaryContent.get(3).innerText).to.contain('Do Not Locate on Same Landing')
          expect($summaryContent.get(4).innerText).to.contain('Rival Gang')
          expect($summaryContent.get(5).innerText).to.contain('Gang violence')
        })
    })
    page.csraTitle().contains('You must consider the CSRA of the prisoners involved')
    page.csraSubTitle().contains('You are moving a prisoner:')
    page.csraMessage().contains('who is CSRA high into a cell with a prisoner who is CSRA high')
    page.alertsTitle().contains('You must consider the risks of the prisoners involved')
    page.alertsSubTitle().contains('You are moving a prisoner:')
    page.offenderAlertMessages().then($messages => {
      cy.get($messages)
        .its('length')
        .should('eq', 4)
      expect($messages.get(0)).to.contain(
        'who has a Risk to LGB alert into a cell with a prisoner who has a sexual orientation of Homosexual'
      )
      expect($messages.get(1)).to.contain('who is an E-List prisoner into a cell with another prisoner')
      expect($messages.get(2)).to.contain('who has a Gang member alert into a cell with another prisoner')
      expect($messages.get(3)).to.contain('who has an Isolated Prisoner alert into a cell with another prisoner')
    })
    page.categoryWarning().contains('who is a Cat A prisoner into a cell with another prisoner')
    page.occupantAlertMessages().then($messages => {
      cy.get($messages)
        .its('length')
        .should('eq', 2)
      expect($messages.get(0)).to.contain('into a cell with a prisoner who has a Gang member alert')
      expect($messages.get(1)).to.contain('into a cell with a prisoner who has an Isolated Prisoner alert')
    })
    page.alertsDetails().then($messages => {
      cy.get($messages)
        .its('length')
        .should('eq', 5)
      expect($messages.get(0)).to.contain('The details of Test User’s alert are')
      expect($messages.get(1)).to.contain('The details of Test User’s alert are')
      expect($messages.get(2)).to.contain('The details of Test User’s alert are')
      expect($messages.get(3)).to.contain('The details of Occupant User’s alert are')
      expect($messages.get(4)).to.contain('The details of Occupant User’s alert are')
    })
    page.alertsComments().then($messages => {
      cy.get($messages)
        .its('length')
        .should('eq', 5)
      expect($messages.get(0)).to.contain('has a large poster on cell wall')
      expect($messages.get(1)).to.contain('has a large poster on cell wall')
      expect($messages.get(2)).to.contain('test')
      expect($messages.get(3)).to.contain('has a large poster on cell wall')
      expect($messages.get(4)).to.contain('test')
    })
    page.alertsDates().then($dates => {
      cy.get($dates)
        .its('length')
        .should('eq', 6)
      expect($dates.get(0)).to.contain('Date added: 20 August 2019')
      expect($dates.get(1)).to.contain('Date added: 20 August 2019')
      expect($dates.get(2)).to.contain('Date added: 20 August 2019')
      expect($dates.get(3)).to.contain('Date added: 20 August 2020')
      expect($dates.get(4)).to.contain('Date added: 20 August 2019')
      expect($dates.get(5)).to.contain('Date added: 20 August 2020')
    })
  })

  it('should show error when nothing is selected', () => {
    stubPrisonDetails()
    const page = MoveValidationPage.goTo(offenderNo, 1)
    page
      .form()
      .submitButton()
      .click()
    page.errorSummary().contains('Select yes if you are sure you want to select the cell')
  })

  it('should redirect to select cell if no is selected', () => {
    stubPrisonDetails()
    const page = MoveValidationPage.goTo(offenderNo, 1)
    page
      .form()
      .confirmationNo()
      .click()
    page
      .form()
      .submitButton()
      .click()
    cy.url().should('include', '/select-cell')
  })

  it('should redirect to confirm cell move on continue', () => {
    stubPrisonDetails()
    const page = MoveValidationPage.goTo(offenderNo, 1)

    cy.task('stubBookingDetails', { firstName: 'Bob', lastName: 'Doe' })
    cy.task('stubLocation', { locationId: 1, locationDetails: { description: 'MDI-1-1' } })

    page
      .form()
      .confirmationYes()
      .click()

    page
      .form()
      .submitButton()
      .click()

    ConfirmCellMovePage.verifyOnPage('Bob Doe', 'HB1')
  })
  it('should redirect to confirm cell when there are no warnings', () => {
    cy.task('stubInmatesAtLocation', {
      inmates: [],
    })
    cy.task('stubBookingNonAssociations', {})

    cy.task('stubBookingDetails', {
      firstName: 'Bob',
      lastName: 'Doe',
      offenderNo,
      bookingId: 1234,
    })

    cy.visit(`/prisoner/${offenderNo}/cell-move/move-validation?cellId=1`)

    ConfirmCellMovePage.verifyOnPage('Bob Doe', 'MDI-1-1')
  })
})
