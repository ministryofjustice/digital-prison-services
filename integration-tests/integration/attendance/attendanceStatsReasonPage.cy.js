const AttendanceStatsReasonPage = require('../../pages/attendance/attendanceStatsReasonPage')

const fromDate = '10/10/2010'
const toDate = '11/10/2010'
const period = 'AM'
const agencyId = 'WWI'
const reason = 'RefusedIncentiveLevelWarning'
const reasonDescription = 'Refused with warning'

const toReason = ($cell) => ({
  name: $cell[0]?.textContent,
  offenderNo: $cell[1]?.textContent,
  location: $cell[2]?.textContent,
  info: $cell[3]?.textContent,
  activity: $cell[4]?.textContent,
  comments: $cell[5]?.textContent,
})

context('A user can view attendance reasons', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: agencyId,
      caseloads: [
        {
          caseLoadId: agencyId,
          description: 'Wandsworth',
          currentlyActive: true,
        },
      ],
    })
    cy.signIn()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    //  cy.task('stubUserMeRoles')
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubGetAbsences', {
      agencyId,
      reason,
      absences: [
        {
          offenderNo: 'G8974UK',
          eventId: 3,
          bookingId: 1133341,
          locationId: 27219,
          firstName: 'Adam',
          lastName: 'Smith',
          cellLocation: `${agencyId}-1`,
          eventDescription: 'Cleaner',
          eventOutcome: 'ACC',
          id: 5812,
          eventLocationId: 26149,
          period,
          prisonId: agencyId,
          attended: true,
          paid: true,
          absentReason: reason,
          comments: 'Asked nicely.',
          suspended: true,
        },
        {
          offenderNo: 'G1234UK',
          eventId: 5,
          bookingId: 1133344,
          locationId: 27239,
          firstName: 'Jim',
          lastName: 'Bo',
          cellLocation: `${agencyId}-2`,
          eventDescription: 'Cleaner',
          eventOutcome: 'ACC',
          id: 5817,
          eventLocationId: 26179,
          period,
          prisonId: agencyId,
          attended: true,
          paid: true,
          absentReason: reason,
          suspended: true,
        },
      ],
      reasonDescription,
    })
  })

  it('Shows the reasons correctly', () => {
    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics/reason/${reason}?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${toDate}`
    )

    const attendanceStatsReasonPage = AttendanceStatsReasonPage.verifyOnPage('Refused with warning')

    attendanceStatsReasonPage.timespan().should('have.text', '10 October 2010 to 11 October 2010 - AM')

    attendanceStatsReasonPage.sortSelect().then(($select) => {
      cy.get($select)
        .find('option')
        .then(($options) => {
          cy.get($options).its('length').should('eq', 6)
        })
    })

    attendanceStatsReasonPage.reasonOccurrences().then(($table) => {
      cy.get($table)
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 3) // 2 results plus table header

          const reasons = Array.from($tableRows).map(($row) => toReason($row.cells))

          expect(reasons[1].name).to.contain('Bo, Jim')
          expect(reasons[1].offenderNo).to.eq('G1234UK')
          expect(reasons[1].location).to.eq('2')
          expect(reasons[1].info).to.contain('Suspended')
          expect(reasons[1].activity).to.contain('Cleaner')
          expect(reasons[1].comments).to.contain('')
          expect(reasons[2].name).to.contain('Smith, Adam')
          expect(reasons[2].offenderNo).to.eq('G8974UK')
          expect(reasons[2].location).to.eq('1')
          expect(reasons[2].info).to.contain('Suspended')
          expect(reasons[2].activity).to.contain('Cleaner')
          expect(reasons[2].comments).to.contain('Asked nicely.')
        })
    })
  })

  it('Re-orders when requested', () => {
    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics/reason/${reason}?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${toDate}`
    )

    const attendanceStatsReasonPage = AttendanceStatsReasonPage.verifyOnPage('Refused with warning')
    attendanceStatsReasonPage.sortSelect().select('2_ascending')

    attendanceStatsReasonPage.reasonOccurrences().then(($table) => {
      cy.get($table)
        .find('tr')
        .then(($tableRows) => {
          const reasons = Array.from($tableRows).map(($row) => toReason($row.cells))

          expect(reasons[1].name).to.contain('Smith, Adam')
          expect(reasons[2].name).to.contain('Bo, Jim')
        })
    })
  })

  it('Shows the correct data when when no absence reasons are found', () => {
    cy.task('stubGetAbsences', { agencyId, reason, absences: [], reasonDescription })

    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics/reason/${reason}?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${toDate}`
    )

    const attendanceStatsReasonPage = AttendanceStatsReasonPage.verifyOnPage('Refused with warning')

    attendanceStatsReasonPage.reasonOccurrences().then(($table) => {
      cy.get($table).find('tr').its('length').should('eq', 1)
    })
  })
})
