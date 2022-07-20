const toCellMove = ($cell) => ({
  name: $cell[0]?.textContent,
  movedFrom: $cell[1]?.textContent,
  movedTo: $cell[2]?.textContent,
  movedBy: $cell[3]?.textContent,
  reason: $cell[4]?.textContent,
  time: $cell[5]?.textContent,
})

context('Cell move history', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: [{ roleCode: 'ROLE_CELL_MOVE' }] })
    cy.signIn()
  })
  beforeEach(() => {
    cy.task('stubCellMoveHistory', {
      assignmentDate: '2021-04-30',
      agencyId: 'MDI',
      cellMoves: [
        {
          bookingId: -34,
          livingUnitId: -16,
          assignmentDate: '2021-04-30',
          assignmentDateTime: `'2021-04-30T11:00:00`,
          assignmentReason: 'ADM',
          agencyId: 'MDI',
          description: 'MDI-H-1-2',
          bedAssignmentHistorySequence: 3,
          movementMadeBy: 'SA',
          offenderNo: 'A12345',
        },
      ],
    })
    cy.task('stubGroups', { id: 'MDI' })
    cy.task('stubCellMoveTypes', [
      {
        domain: 'CHG_HOUS_RSN',
        code: 'ADM',
        description: 'Administrative',
        activeFlag: 'N',
        listSeq: 1,
        systemDataFlag: 'N',
        subCodes: [],
      },
      {
        domain: 'CHG_HOUS_RSN',
        code: 'BEH',
        description: 'Behaviour',
        activeFlag: 'N',
        listSeq: 2,
        systemDataFlag: 'N',
        subCodes: [],
      },
    ])
    cy.task('stubGetPrisoners', [{ offenderNo: 'A12345', firstName: 'BOB', lastName: 'DOE' }])
    cy.task('stubStaff', { staffId: 'SA', firstName: 'Pow', lastName: 'Now' })
  })

  it('should show default message for no cell moves found', () => {
    cy.visit('/change-someones-cell/recent-cell-moves/history?date=2021-04-30&reason=D')

    cy.get('[data-test="no-cell-moves"]').should('be.visible')
    cy.get('[data-test="cell-history-table"]').should('not.exist')
  })

  it('should display cell move history for date', () => {
    cy.visit('/change-someones-cell/recent-cell-moves/history?date=2021-04-30')

    cy.get('[data-test="cell-history-table"]').then(($table) => {
      cy.get($table)
        .find('tr')
        .then(($tableRows) => {
          const cellMoves = Array.from($tableRows).map(($row) => toCellMove($row.cells))

          expect(cellMoves[1].name).to.contain('Doe, Bob')
          expect(cellMoves[1].movedFrom).to.eq('No cell allocated')
          expect(cellMoves[1].movedTo).to.eq('H-1-2')
          expect(cellMoves[1].movedBy).to.contain('')
          expect(cellMoves[1].reason).to.contain('Administrative')
          expect(cellMoves[1].time).to.contain('11:00')
        })
    })
  })

  context('When the user does not have the correct cell move roles', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: [] })
      cy.signIn()
    })

    it('should display page not found', () => {
      cy.visit('/change-someones-cell', { failOnStatusCode: false })

      cy.get('h1').contains('Page not found')
    })
  })
})
