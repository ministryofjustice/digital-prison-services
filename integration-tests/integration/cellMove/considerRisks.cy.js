const ConsiderRisksPage = require('../../pages/cellMove/considerRisksPage')
const ConfirmCellMovePage = require('../../pages/cellMove/confirmCellMovePage')

const offenderNo = 'A1234A'

context('A user can see conflicts in cell', () => {
  beforeEach(() => {
    cy.task('stubCellMoveTypes', [
      {
        code: 'ADM',
        activeFlag: 'Y',
        description: 'Administrative',
      },
      {
        code: 'BEH',
        activeFlag: 'Y',
        description: 'Behaviour',
      },
    ])
  })
  const stubPrisonDetails = () => {
    cy.task('stubPrisonerFullDetail', {
      prisonerDetail: {
        bookingId: 1234,
        firstName: 'Test',
        lastName: 'User',
        csra: 'High',
        csraClassificationCode: 'HI',
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
          {
            alertId: 4,
            alertType: 'H',
            alertTypeDescription: 'Self Harm',
            alertCode: 'HA',
            alertCodeDescription: 'ACCT open',
            comment: 'Test comment',
            dateCreated: '2021-02-18',
            expired: false,
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
          },
          {
            alertId: 5,
            alertType: 'H',
            alertTypeDescription: 'Self Harm',
            alertCode: 'HA1',
            alertCodeDescription: 'ACCT post closure',
            comment: '',
            dateCreated: '2021-02-19',
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
        csraClassificationCode: 'HI',
        agencyId: 'MDI',
        offenderNo: 'A12346',
        assessments: [],
        assignedLivingUnit: {},
        categoryCode: 'B',
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
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
    const page = ConsiderRisksPage.goTo(offenderNo, 1)
    page.nonAssociationsSubTitle().contains('Test User has a non-association with a prisoner on this wing:')
    page.nonAssociationsSummary().then(($summary) => {
      cy.get($summary)
        .find('dt')
        .then(($summaryLabels) => {
          cy.get($summaryLabels).its('length').should('eq', 6)
          expect($summaryLabels.get(0).innerText).to.contain('Name')
          expect($summaryLabels.get(1).innerText).to.contain('Prison number')
          expect($summaryLabels.get(2).innerText).to.contain('Location')
          expect($summaryLabels.get(3).innerText).to.contain('Type')
          expect($summaryLabels.get(4).innerText).to.contain('Reason')
          expect($summaryLabels.get(5).innerText).to.contain('Comment')
        })

      cy.get($summary)
        .find('dd')
        .then(($summaryContent) => {
          cy.get($summaryContent).its('length').should('eq', 6)
          expect($summaryContent.get(0).innerText).to.contain('Doe1, Bob1')
          expect($summaryContent.get(1).innerText).to.contain('A12345')
          expect($summaryContent.get(2).innerText).to.contain('MDI-1-3-026')
          expect($summaryContent.get(3).innerText).to.contain('Do Not Locate on Same Landing')
          expect($summaryContent.get(4).innerText).to.contain('Rival Gang')
          expect($summaryContent.get(5).innerText).to.contain('Gang violence')
        })
    })
    page
      .csraMessages()
      .find('li')
      .then(($messages) => {
        cy.get($messages).its('length').should('eq', 2)
        expect($messages.get(0).innerText).to.contain('Test User is CSRA High')
        expect($messages.get(1).innerText).to.contain('Occupant User is CSRA High')
      })
    page.offenderAlertsHeading().contains('Test User has:')
    page.offenderAlertMessages().then(($messages) => {
      cy.get($messages).its('length').should('eq', 6)
      expect($messages.get(0)).to.contain(
        'a Risk to LGB alert and Occupant User has a sexual orientation of Homosexual'
      )
      expect($messages.get(1)).to.contain('an E-List alert')
      expect($messages.get(2)).to.contain('a Gang member alert')
      expect($messages.get(3)).to.contain('an Isolated Prisoner alert')
      expect($messages.get(4)).to.contain('an ACCT open alert')
      expect($messages.get(5)).to.contain('an ACCT post closure alert')
    })
    page.categoryWarning().contains('a Cat A rating and Occupant User is a Cat B')
    page.occupantAlertsHeading().contains('Occupant User has:')
    page.occupantAlertMessages().then(($messages) => {
      cy.get($messages).its('length').should('eq', 2)
      expect($messages.get(0)).to.contain('a Gang member alert')
      expect($messages.get(1)).to.contain('an Isolated Prisoner alert')
    })
    page.alertsComments().then(($messages) => {
      cy.get($messages).its('length').should('eq', 8)
      expect($messages.get(0)).to.contain('has a large poster on cell wall')
      expect($messages.get(1)).to.contain('has a large poster on cell wall')
      expect($messages.get(2)).to.contain('No details entered')
      expect($messages.get(3)).to.contain('test')
      expect($messages.get(4)).to.contain('Test comment')
      expect($messages.get(5)).to.contain('No details entered')
    })
    page.alertsDates().then(($dates) => {
      cy.get($dates).its('length').should('eq', 8)
      expect($dates.get(0)).to.contain('Date added: 20 August 2019')
      expect($dates.get(1)).to.contain('Date added: 20 August 2019')
      expect($dates.get(2)).to.contain('Date added: 20 August 2019')
      expect($dates.get(3)).to.contain('Date added: 20 August 2020')
      expect($dates.get(4)).to.contain('Date added: 18 February 2021')
      expect($dates.get(5)).to.contain('Date added: 19 February 2021')
      expect($dates.get(6)).to.contain('Date added: 20 August 2019')
      expect($dates.get(7)).to.contain('Date added: 20 August 2020')
    })
    page.form().confirmationInput().contains('Are you sure you want to move Test User into a cell with Occupant User?')
  })

  it('should show error when nothing is selected', () => {
    stubPrisonDetails()
    const page = ConsiderRisksPage.goTo(offenderNo, 1)
    page.form().submitButton().click()
    page.errorSummary().contains('Select yes if you are sure you want to select the cell')
  })

  it('should redirect to select cell if no is selected', () => {
    stubPrisonDetails()
    const page = ConsiderRisksPage.goTo(offenderNo, 1)
    page.form().confirmationNo().click()
    page.form().submitButton().click()
    cy.url().should('include', '/select-cell')
  })

  it('should redirect to confirm cell move on continue', () => {
    stubPrisonDetails()
    const page = ConsiderRisksPage.goTo(offenderNo, 1)

    cy.task('stubBookingDetails', { firstName: 'Bob', lastName: 'Doe' })
    cy.task('stubLocation', { locationId: 1, locationDetails: { description: 'MDI-1-1' } })

    page.form().confirmationYes().click()

    page.form().submitButton().click()

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

    cy.visit(`/prisoner/${offenderNo}/cell-move/consider-risks?cellId=1`)

    ConfirmCellMovePage.verifyOnPage('Bob Doe', 'MDI-1-1')
  })

  it('should not show CSRA messages and have the correct confirmation label', () => {
    cy.task('stubInmatesAtLocation', {
      inmates: [],
    })
    cy.task('stubBookingDetails', {
      firstName: 'Bob',
      lastName: 'Doe',
      offenderNo,
      bookingId: 1234,
    })

    const page = ConsiderRisksPage.goTo(offenderNo, 1)
    page.csraMessages().should('not.exist')
    page.form().confirmationInput().contains('Are you sure you want to select this cell?')
  })
})
