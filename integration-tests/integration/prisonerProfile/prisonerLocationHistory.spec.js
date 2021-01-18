const PrisonerLocationHistoryPage = require('../../pages/prisonerProfile/prisonerLocationHistoryPage')
const { notEnteredMessage } = require('../../../backend/common-messages')

context('Prisoner location history', () => {
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  context('Basic page functionality', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubAttributesForLocation', {
        id: 1,
        description: 'MDI-1-1-015',
        capacity: 2,
        noOfOccupants: 2,
        attributes: [{ description: 'Double occupancy' }],
      })
      cy.task('stubHistoryForLocation', [
        {
          bookingId: 1,
          livingUnitId: 1,
          assignmentDate: '2020-08-28',
          assignmentDateTime: '2020-08-28T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          assignmentReason: 'CLA',
          bedAssignmentHistorySequence: 1,
        },
        {
          bookingId: 2,
          livingUnitId: 1,
          assignmentDate: '2020-08-27',
          assignmentDateTime: '2020-08-27T11:10:00',
          assignmentReason: 'ADM',
          assignmentEndDate: '2020-08-28',
          assignmentEndDateTime: '2020-08-28T11:00:00',
          agencyId: 'LEI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          bedAssignmentHistorySequence: 1,
        },
        {
          bookingId: 3,
          livingUnitId: 1,
          assignmentDate: '2020-08-25',
          assignmentDateTime: '2020-08-25T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          assignmentReason: 'CLA',
          bedAssignmentHistorySequence: 1,
        },
      ])
      cy.task('stubAgencyDetails', { agencyId: 'MDI', details: { agencyId: 'MDI', description: 'Moorland' } })
      cy.task('stubUserCaseLoads', [
        {
          caseLoadId: 'MDI',
          description: 'Moorland Closed (HMP & YOI)',
          type: 'INST',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
        },
      ])
      cy.task('stubPrisonerDetail', {
        prisonerDetail: { offenderNo: 'ABC123', bookingId: 1, firstName: 'John', lastName: 'Smith' },
        bookingId: 1,
      })
      cy.task('stubPrisonerDetail', {
        prisonerDetail: { offenderNo: 'ABC456', bookingId: 2, firstName: 'Steve', lastName: 'Jones' },
        bookingId: 2,
      })
      cy.task('stubPrisonerDetail', {
        prisonerDetail: { offenderNo: 'ABC789', bookingId: 3, firstName: 'Barry', lastName: 'Stevenson' },
        bookingId: 3,
      })

      cy.task('stubGetCellMoveReason', {
        bookingId: 1,
        bedAssignmentHistorySequence: 1,
        cellMoveReason: { cellMoveReason: { caseNoteId: 123 } },
      })

      cy.task('stubGetOffenderCaseNote', {
        offenderId: 'A1234A',
        caseNoteId: 123,
        caseNote: { text: 'A long comment about what happened on the day to cause the move.' },
      })

      cy.task('stubGetStaffDetails', {
        staffId: 'USERID_GEN',
        response: { firstName: 'Joe', lastName: 'Bloggss' },
      })

      const caseNotesTypes = [
        {
          code: 'MOVED_CELL',
          subCodes: [
            { code: 'ADM', description: 'Administrative' },
            { code: 'BEH', description: 'Behaviour' },
            { code: 'CLA', description: 'Classification or re-classification' },
            { code: 'CON', description: 'Conflict with other prisoners' },
            { code: 'LN', description: 'Local needs' },
            { code: 'VP', description: 'Vulnerable prisoner' },
          ],
        },
      ]
      cy.task('stubCaseNoteTypes', caseNotesTypes)
    })

    it('should load and display the correct data', () => {
      cy.visit(`/prisoner/${offenderNo}/location-history?fromDate=2020-08-28&locationId=1&agencyId=MDI`)

      const prisonerLocationHistoryPage = PrisonerLocationHistoryPage.verifyOnPage()
      prisonerLocationHistoryPage.title().contains('John Smith’s history in location 1-1-015')
      prisonerLocationHistoryPage.establishment().contains('Moorland')
      prisonerLocationHistoryPage.movedIn().contains('28/08/2020 - 11:20')
      prisonerLocationHistoryPage.movedOut().contains('Current cell')
      prisonerLocationHistoryPage.type().contains('Double occupancy')

      prisonerLocationHistoryPage.results().then($table => {
        cy.get($table)
          .find('td')
          .then($tableCells => {
            cy.get($tableCells)
              .its('length')
              .should('eq', 8) // 2 rows of 4 cells

            expect($tableCells.get(0)).to.contain('Jones, Steve')
            expect($tableCells.get(1)).to.contain('ABC456')
            expect($tableCells.get(2)).to.contain('27/08/2020 - 11:10')
            expect($tableCells.get(3)).to.contain('28/08/2020 - 11:00')
            expect($tableCells.get(4)).to.contain('Stevenson, Barry (opens in a new tab)')
            expect($tableCells.get(5)).to.contain('ABC789')
            expect($tableCells.get(6)).to.contain('25/08/2020 - 11:20')
            expect($tableCells.get(7)).to.contain('Currently sharing')
          })
      })
    })

    it('should load and display the correct data when the offender has moved out', () => {
      cy.task('stubHistoryForLocation', [
        {
          bookingId: 1,
          livingUnitId: 1,
          assignmentDate: '2020-08-28',
          assignmentDateTime: '2020-08-28T11:20:39',
          assignmentEndDate: '2020-08-28',
          assignmentEndDateTime: '2020-08-28T12:00:00',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          assignmentReason: 'CLA',
          bedAssignmentHistorySequence: 1,
        },
        {
          bookingId: 2,
          livingUnitId: 1,
          assignmentDate: '2020-08-27',
          assignmentDateTime: '2020-08-27T11:10:00',
          assignmentReason: 'ADM',
          assignmentEndDate: '2020-08-28',
          assignmentEndDateTime: '2020-08-28T11:00:00',
          agencyId: 'LEI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          bedAssignmentHistorySequence: 1,
        },
        {
          bookingId: 3,
          livingUnitId: 1,
          assignmentDate: '2020-08-25',
          assignmentDateTime: '2020-08-25T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          assignmentReason: 'CLA',
          bedAssignmentHistorySequence: 1,
        },
      ])
      cy.visit(`/prisoner/${offenderNo}/location-history?fromDate=2020-08-28&locationId=1&agencyId=MDI`)

      const prisonerLocationHistoryPage = PrisonerLocationHistoryPage.verifyOnPage()
      prisonerLocationHistoryPage.title().contains('John Smith’s history in location 1-1-015')
      prisonerLocationHistoryPage.establishment().contains('Moorland')
      prisonerLocationHistoryPage.movedIn().contains('28/08/2020 - 11:20')
      prisonerLocationHistoryPage.movedOut().contains('28/08/2020 - 12:00')
      prisonerLocationHistoryPage.type().contains('Double occupancy')

      prisonerLocationHistoryPage.results().then($table => {
        cy.get($table)
          .find('td')
          .then($tableCells => {
            cy.get($tableCells)
              .its('length')
              .should('eq', 8) // 2 rows of 4 cells

            expect($tableCells.get(0)).to.contain('Jones, Steve')
            expect($tableCells.get(1)).to.contain('ABC456')
            expect($tableCells.get(2)).to.contain('27/08/2020 - 11:10')
            expect($tableCells.get(3)).to.contain('28/08/2020 - 11:00')
            expect($tableCells.get(4)).to.contain('Stevenson, Barry (opens in a new tab)')
            expect($tableCells.get(5)).to.contain('ABC789')
            expect($tableCells.get(6)).to.contain('25/08/2020 - 11:20')
            expect($tableCells.get(7)).to.contain('John Smith moved out')
          })
      })
    })

    it('should display a message when there is no sharing history', () => {
      cy.task('stubHistoryForLocation', [
        {
          bookingId: 1,
          livingUnitId: 1,
          assignmentDate: '2020-08-28',
          assignmentDateTime: '2020-08-28T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          assignmentReason: 'CLA',
          bedAssignmentHistorySequence: 1,
        },
      ])

      cy.visit(`/prisoner/${offenderNo}/location-history?fromDate=2020-08-28&locationId=1&agencyId=MDI`)

      const prisonerLocationHistoryPage = PrisonerLocationHistoryPage.verifyOnPage()
      prisonerLocationHistoryPage.noHistoryMessage().contains('John Smith has not shared this cell with anyone else.')
    })

    it('should should show the alternative possessive page title', () => {
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Jones', agencyId: 'MDI' })
      cy.task('stubHistoryForLocation', [
        {
          bookingId: 1,
          livingUnitId: 1,
          assignmentDate: '2020-08-28',
          assignmentDateTime: '2020-08-28T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          assignmentReason: 'CLA',
          bedAssignmentHistorySequence: 1,
        },
      ])

      cy.visit(`/prisoner/${offenderNo}/location-history?fromDate=2020-08-28&locationId=1&agencyId=MDI`)

      const prisonerLocationHistoryPage = PrisonerLocationHistoryPage.verifyOnPage()
      prisonerLocationHistoryPage.title().contains('John Jones’')
      prisonerLocationHistoryPage.noHistoryMessage().contains('John Jones has not shared this cell with anyone else.')
    })

    it('should show moved by, reason for move and what happened', () => {
      cy.visit(`/prisoner/${offenderNo}/location-history?fromDate=2020-08-28&locationId=1&agencyId=MDI`)

      const prisonerLocationHistoryPage = PrisonerLocationHistoryPage.verifyOnPage()
      prisonerLocationHistoryPage.movedBy().contains('Joe Bloggs')
      prisonerLocationHistoryPage.reasonForMove().contains('Classification or re-classification')
      prisonerLocationHistoryPage
        .whatHappened()
        .contains('A long comment about what happened on the day to cause the move.')
    })

    it('when cell move reason throws a 404 then we default comment', () => {
      cy.task('stubGetCellMoveReason', {
        bookingId: 1,
        bedAssignmentHistorySequence: 1,
        cellMoveReason: null,
        status: 404,
      })

      cy.visit(`/prisoner/${offenderNo}/location-history?fromDate=2020-08-28&locationId=1&agencyId=MDI`)

      const prisonerLocationHistoryPage = PrisonerLocationHistoryPage.verifyOnPage()
      prisonerLocationHistoryPage.movedBy().contains('Joe Bloggs')
      prisonerLocationHistoryPage.reasonForMove().contains(notEnteredMessage)
      prisonerLocationHistoryPage.whatHappened().contains(notEnteredMessage)
    })

    it('when assignmentReason is missing then default reason', () => {
      cy.task('stubHistoryForLocation', [
        {
          bookingId: 1,
          livingUnitId: 1,
          assignmentDate: '2020-08-28',
          assignmentDateTime: '2020-08-28T11:20:39',
          agencyId: 'MDI',
          description: 'MDI-1-1-015',
          movementMadeBy: 'USERID_GEN',
          bedAssignmentHistorySequence: 1,
        },
      ])

      cy.visit(`/prisoner/${offenderNo}/location-history?fromDate=2020-08-28&locationId=1&agencyId=MDI`)

      const prisonerLocationHistoryPage = PrisonerLocationHistoryPage.verifyOnPage()
      prisonerLocationHistoryPage.movedBy().contains('Joe Bloggs')
      prisonerLocationHistoryPage.reasonForMove().contains(notEnteredMessage)
      prisonerLocationHistoryPage
        .whatHappened()
        .contains('A long comment about what happened on the day to cause the move.')
    })
  })
})
