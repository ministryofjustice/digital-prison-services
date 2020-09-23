const AttendanceStatsPage = require('../../pages/attendance/attendanceStatsPage')

const fromDate = '10/10/2010'
const period = 'AM'
const agencyId = 'WWI'

context('A user can view attendance changes', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubUserMeRoles')
    cy.task('stubUserMe')
    cy.task('stubUserCaseLoads')
    cy.task('stubGetAbsenceReasons')
    cy.task('stubAttendanceChanges', [
      {
        eventId: 1,
        prisonId: 'WWI',
        changedBy: 'ITAG_USER',
        changedOn: '2010-10-10T20:00',
        changedFrom: 'Attended',
        changedTo: 'Refused',
      },
    ])
    cy.task('stubAttendanceStats', {
      agencyId,
      fromDate: '2010-10-10',
      period,
      stats: {
        notRecorded: 1,
        paidReasons: {
          acceptableAbsence: 2,
          approvedCourse: 3,
          attended: 4,
          notRequired: 5,
        },
        scheduleActivities: 6,
        suspended: 7,
        unpaidReasons: {
          refused: 8,
          refusedIncentiveLevelWarning: 9,
          restDay: 10,
          restInCellOrSick: 11,
          sessionCancelled: 12,
          unacceptableAbsence: 13,
        },
      },
    })
  })

  it('The shows the stats correctly', () => {
    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}`
    )
    const attendanceStatsPage = AttendanceStatsPage.verifyOnPage()
    attendanceStatsPage.changes().contains('1')
    attendanceStatsPage.unaccountedfor().contains('1')
    attendanceStatsPage.suspended().contains('7')
    attendanceStatsPage.attended().contains('4')
    attendanceStatsPage.acceptableAbsence().contains('2')
    attendanceStatsPage.approvedCourse().contains('3')
    attendanceStatsPage.notRequired().contains('5')
    attendanceStatsPage.refused().contains('8')
    attendanceStatsPage.refusedWithWarning().contains('9')
    attendanceStatsPage.restDay().contains('10')
    attendanceStatsPage.restInCellOrSick().contains('11')
    attendanceStatsPage.sessionCancelled().contains('12')
    attendanceStatsPage.unacceptableAbsenceWithWarning().contains('13')
  })

  it('Navigates to the changes screen correctly', () => {
    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}`
    )
    const attendanceStatsPage = AttendanceStatsPage.verifyOnPage()
    attendanceStatsPage.changes().click()
    cy.url().should('include', 'attendance-changes')
  })

  it('Navigates to the suspended screen correctly', () => {
    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}`
    )
    const attendanceStatsPage = AttendanceStatsPage.verifyOnPage()
    attendanceStatsPage.suspended().click()
    cy.url().should('include', 'suspended')
  })

  it('The page loads with 0s when no stats', () => {
    cy.task('stubAttendanceChanges', [])
    cy.task('stubAttendanceStats', {
      agencyId,
      fromDate: '2010-10-10',
      period,
      stats: {
        notRecorded: 0,
        paidReasons: {
          acceptableAbsence: 0,
          approvedCourse: 0,
          attended: 0,
          notRequired: 0,
        },
        scheduleActivities: 0,
        suspended: 0,
        unpaidReasons: {
          refused: 0,
          refusedIncentiveLevelWarning: 0,
          restDay: 0,
          restInCellOrSick: 0,
          sessionCancelled: 0,
          unacceptableAbsence: 0,
        },
      },
    })

    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}`
    )
    const attendanceStatsPage = AttendanceStatsPage.verifyOnPage()
    attendanceStatsPage.changes().contains('0')
    attendanceStatsPage.unaccountedfor().contains('0')
    attendanceStatsPage.suspended().contains('0')
    attendanceStatsPage.attended().contains('0')
    attendanceStatsPage.acceptableAbsence().contains('0')
    attendanceStatsPage.approvedCourse().contains('0')
    attendanceStatsPage.refusedWithWarning().contains('0')
    attendanceStatsPage.restDay().contains('0')
    attendanceStatsPage.restInCellOrSick().contains('0')
    attendanceStatsPage.sessionCancelled().contains('0')
    attendanceStatsPage.unacceptableAbsenceWithWarning().contains('0')
  })
})
