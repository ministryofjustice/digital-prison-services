const moment = require('moment')

const verifyOnPage = () => cy.get('h1').contains('7 day cell move history')

context('7 day cell move history page', () => {
  const today = moment().format('YYYY-MM-DD')
  const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')

  const lastSevenDays = [...Array(7).keys()].map((days) => moment().subtract(days, 'day').format('YYYY-MM-DD'))

  const dataSets = {
    [today]: [
      {
        bookingId: -34,
        livingUnitId: -16,
        assignmentDate: today,
        assignmentReason: 'ADM',
        agencyId: 'MDI',
        description: 'MDI-H-1-2',
        bedAssignmentHistorySequence: 2,
        movementMadeBy: 'SA',
      },
    ],
    [yesterday]: [
      {
        bookingId: -34,
        livingUnitId: -16,
        assignmentDate: yesterday,
        assignmentReason: 'ADM',
        agencyId: 'MDI',
        description: 'MDI-H-1-2',
        bedAssignmentHistorySequence: 3,
        movementMadeBy: 'SA',
      },
      {
        bookingId: -34,
        livingUnitId: -16,
        assignmentDate: yesterday,
        assignmentReason: 'ADM',
        agencyId: 'MDI',
        description: 'MDI-H-1-2',
        bedAssignmentHistorySequence: 4,
        movementMadeBy: 'SA',
      },
    ],
  }
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: [{ roleCode: 'ROLE_CELL_MOVE' }] })
    cy.signIn()
  })
  beforeEach(() => {
    lastSevenDays.forEach((assignmentDate) =>
      cy.task('stubCellMoveHistory', {
        assignmentDate,
        agencyId: 'MDI',
        cellMoves: dataSets[assignmentDate] || [],
      })
    )
  })
  it('show stats for the last seven days', () => {
    cy.visit('/change-someones-cell/recent-cell-moves')

    verifyOnPage()

    cy.get(`[data-qa="daily-stats-${today}"]`).then(($element) => {
      expect($element[0].innerText).to.eq('1')
      expect($element[0].innerHTML).contains(`/change-someones-cell/recent-cell-moves/history?date=${today}`)
    })

    cy.get(`[data-qa="daily-stats-${yesterday}"]`).then(($element) => {
      expect($element[0].innerText).to.eq('2')
      expect($element[0].innerHTML).contains(`/change-someones-cell/recent-cell-moves/history?date=${yesterday}`)
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
