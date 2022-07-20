context('No cell allocated page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  beforeEach(() => {
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubInmates', {
      locationId: 'MDI',
      count: 1000,
      data: [
        {
          bookingId: 1201093,
          bookingNo: '38508A',
          offenderNo: 'A7777DY',
          firstName: 'TOMMY',
          lastName: 'BIGGLES',
          dateOfBirth: '1970-01-01',
          age: 51,
          agencyId: 'MDI',
          assignedLivingUnitId: 722023,
          assignedLivingUnitDesc: 'CSWAP',
          convictedStatus: 'Convicted',
          imprisonmentStatus: 'ADIMP_ORA20',
          alertsCodes: [],
          alertsDetails: [],
          legalStatus: 'SENTENCED',
        },
        {
          bookingId: 1055111,
          bookingNo: 'V38990',
          offenderNo: 'G4081UT',
          firstName: 'BUCK',
          middleName: 'KEVETRIA',
          lastName: 'BINNALL',
          dateOfBirth: '1992-12-03',
          age: 28,
          agencyId: 'MDI',
          assignedLivingUnitId: 25800,
          assignedLivingUnitDesc: '3-1-029',
          facialImageId: 3668602,
          convictedStatus: 'Convicted',
          imprisonmentStatus: 'SENT03',
          alertsCodes: [],
          alertsDetails: [],
          legalStatus: 'SENTENCED',
        },
      ],
    })
    cy.task('stubGetPrisoners', [
      {
        offenderNo: 'A7777DY',
        latestBookingId: 1201093,
        firstName: 'TOMMY',
        lastName: 'BIGGLES',
      },
    ])
    cy.task('stubOffenderCellHistory', {
      history: {
        content: [
          {
            bookingId: 1201093,
            livingUnitId: 3979,
            assignmentDate: '2015-11-13',
            assignmentDateTime: '2015-11-13T16:53:11',
            assignmentEndDate: '2015-11-13',
            assignmentEndDateTime: '2015-11-13T16:56:26',
            agencyId: 'MDI',
            description: 'MDI-RECP',
            bedAssignmentHistorySequence: 1,
            movementMadeBy: 'ZQH07Y',
          },
          {
            bookingId: 1201093,
            livingUnitId: 391874,
            assignmentDate: '2015-11-13',
            assignmentDateTime: '2015-11-13T16:56:26',
            assignmentReason: 'ADM',
            assignmentEndDate: '2015-11-13',
            assignmentEndDateTime: '2015-11-13T22:50:02',
            agencyId: 'MDI',
            description: 'MDI-CSWAP',
            bedAssignmentHistorySequence: 2,
            movementMadeBy: 'ZQH07Y',
          },
        ],
      },
    })
    cy.task('stubGetUserDetailsList', [
      {
        firstName: 'Barry',
        lastName: 'Smith',
        username: 'ZQH07Y',
      },
    ])
  })

  it('should load the page with the correct data', () => {
    cy.visit('/establishment-roll/no-cell-allocated')

    cy.get('h1').should('contain', 'No cell allocated')

    cy.get('[data-test="no-cell-allocated-table"]').then(($table) => {
      cy.get($table)
        .find('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 1)
          expect($tableRows.get(0).innerText).to.contain('\tBiggles, Tommy\tA7777DY\tRECP\t16:56\tBarry Smith\t')
        })
    })
    cy.get('[data-test="prisoner-profile-link"]').then(($prisonerProfileLinks) => {
      cy.get($prisonerProfileLinks).its('length').should('eq', 1)
      cy.get($prisonerProfileLinks.get(0)).should('have.attr', 'href').should('include', '/prisoner/A7777DY')
    })
    cy.get('[data-test="allocate-cell-link"]').should('not.exist')
  })

  describe('when there are no inmates to be shown', () => {
    beforeEach(() => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 0,
        data: [],
      })
    })

    it('should show a message that there are no results only', () => {
      cy.visit('/establishment-roll/no-cell-allocated')

      cy.get('h1').should('contain', 'No cell allocated')

      cy.get('[data-test="no-results-message"]').should('exist')
      cy.get('[data-test="results-message"]').should('not.exist')
      cy.get('[data-test="no-cell-allocated-table"]').should('not.exist')
      cy.get('[data-test="prisoner-profile-link"]').should('not.exist')
      cy.get('[data-test="allocate-cell-link"]').should('not.exist')
    })
  })

  describe('with permission check', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: ['ROLE_CELL_MOVE'] })
      cy.signIn()
    })
    it('should show the allocate cell links if user has correct roles', () => {
      cy.visit('/establishment-roll/no-cell-allocated')

      cy.get('[data-test="allocate-cell-link"]').then(($allocateCellLink) => {
        cy.get($allocateCellLink).its('length').should('eq', 1)
        cy.get($allocateCellLink.get(0))
          .should('have.attr', 'href')
          .should('include', '/prisoner/A7777DY/cell-move/search-for-cell')
      })
    })
  })
})
