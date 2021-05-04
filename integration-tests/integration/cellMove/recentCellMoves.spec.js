const moment = require('moment')

const verifyOnPage = () => cy.get('h1').contains('7 day cell move history')

context('7 day cell move history page', () => {
  const today = moment().format('YYYY-MM-DD')
  const yesterday = moment()
    .subtract(1, 'day')
    .format('YYYY-MM-DD')

  const lastSevenDays = [...Array(7).keys()].map(days =>
    moment()
      .subtract(days, 'day')
      .format('YYYY-MM-DD')
  )

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
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    lastSevenDays.forEach(assignmentDate =>
      cy.task('stubCellMoveHistory', {
        assignmentDate,
        cellMoves: dataSets[assignmentDate] || [],
      })
    )
  })
  it('show stats for the last seven days', () => {
    cy.visit('/change-someones-cell/recent-cell-moves')

    verifyOnPage()

    cy.get(`[data-qa="daily-stats-${today}"]`).then($element => {
      expect($element[0].innerText).to.eq('1')
      expect($element[0].innerHTML).contains(`/change-someones-cell/recent-cell-moves/history?date=${today}`)
    })

    cy.get(`[data-qa="daily-stats-${yesterday}"]`).then($element => {
      expect($element[0].innerText).to.eq('2')
      expect($element[0].innerHTML).contains(`/change-someones-cell/recent-cell-moves/history?date=${yesterday}`)
    })
  })
})
