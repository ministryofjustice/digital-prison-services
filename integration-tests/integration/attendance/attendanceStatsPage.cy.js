const AttendanceStatsPage = require('../../pages/attendance/attendanceStatsPage')
const AttendanceStatsSuspendedPage = require('../../pages/attendance/attendanceStatsSuspendedPage')

const fromDate = '10/10/2010'
const fromDateApi = '2010-10-10'
const agencyId = 'MDI'

context('A user can view attendance changes', () => {
  const period = 'AM'

  beforeEach(() => {
    cy.task('resetAndStubTokenVerification')
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'MDI',
        caseloads: [
          {
            caseLoadId: 'MDI',
            description: 'Wandsworth',
            currentlyActive: true,
          },
        ],
      })
      cy.signIn()
    })

    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubAttendanceChanges', [
      {
        eventId: 1,
        prisonId: 'MDI',
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
        attended: 4,
        paidReasons: {
          approvedCourse: 3,
          notRequired: 5,
          acceptableAbsence: 2,
          acceptableAbsenceDescription: 'Acceptable absence',
          approvedCourseDescription: 'Approved course',
          notRequiredDescription: 'Not required to attend',
        },
        scheduleActivities: 6,
        suspended: 7,
        unpaidReasons: {
          restDay: 10,
          restInCellOrSick: 11,
          refused: 8,
          refusedIncentiveLevelWarning: 9,
          sessionCancelled: 12,
          unacceptableAbsenceIncentiveLevelWarning: 13,
          refusedDescription: 'Refused to attend',
          refusedIncentiveLevelWarningDescription: 'Refused to attend with warning',
          sessionCancelledDescription: 'Session cancelled',
          unacceptableAbsenceDescription: 'Unacceptable absence',
          unacceptableAbsenceIncentiveLevelWarningDescription: 'Unacceptable absence with warning',
          restDayDescription: 'Rest day',
          restInCellOrSickDescription: 'Rest in cell or sick',
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
        attended: 0,
        paidReasons: {
          approvedCourse: 0,
          notRequired: 0,
          acceptableAbsence: 0,
          acceptableAbsenceDescription: 'Acceptable absence',
          approvedCourseDescription: 'Approved course',
          notRequiredDescription: 'Not required to attend',
        },
        scheduleActivities: 0,
        suspended: 0,
        unpaidReasons: {
          restDay: 0,
          restInCellOrSick: 0,
          refused: 0,
          refusedIncentiveLevelWarning: 0,
          sessionCancelled: 0,
          unacceptableAbsenceIncentiveLevelWarning: 0,
          refusedDescription: 'Refused to attend',
          refusedIncentiveLevelWarningDescription: 'Refused to attend with warning',
          sessionCancelledDescription: 'Session cancelled',
          unacceptableAbsenceDescription: 'Unacceptable absence',
          unacceptableAbsenceIncentiveLevelWarningDescription: 'Unacceptable absence with warning',
          restDayDescription: 'Rest day',
          restInCellOrSickDescription: 'Rest in cell or sick',
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

context('Attendance - suspended stats', () => {
  const period = 'AM_PM'

  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'MDI',
      caseloads: [
        {
          caseLoadId: 'MDI',
          description: 'Wandsworth',
          currentlyActive: true,
        },
      ],
    })
    cy.signIn()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubAttendanceChanges', [
      {
        eventId: 1,
        prisonId: 'MDI',
        changedBy: 'ITAG_USER',
        changedOn: '2010-10-10T20:00',
        changedFrom: 'Attended',
        changedTo: 'Refused',
      },
    ])
    cy.task('stubAttendanceStats', {
      agencyId,
      fromDate: '2010-10-10',
      period: '',
      stats: {
        notRecorded: 1,
        attended: 4,
        paidReasons: {
          approvedCourse: 3,
          notRequired: 5,
          acceptableAbsence: 2,
          acceptableAbsenceDescription: 'Acceptable absence',
          approvedCourseDescription: 'Approved course',
          notRequiredDescription: 'Not required to attend',
        },
        scheduleActivities: 6,
        suspended: 3,
        unpaidReasons: {
          restDay: 10,
          restInCellOrSick: 11,
          refused: 8,
          refusedIncentiveLevelWarning: 9,
          sessionCancelled: 12,
          unacceptableAbsenceIncentiveLevelWarning: 13,
          refusedDescription: 'Refused to attend',
          refusedIncentiveLevelWarningDescription: 'Refused to attend with warning',
          sessionCancelledDescription: 'Session cancelled',
          unacceptableAbsenceDescription: 'Unacceptable absence',
          unacceptableAbsenceIncentiveLevelWarningDescription: 'Unacceptable absence with warning',
          restDayDescription: 'Rest day',
          restInCellOrSickDescription: 'Rest in cell or sick',
        },
      },
    })
    cy.task('stubOffenderSuspendedActivitiesOverDateRange', {
      agencyId,
      fromDate: fromDateApi,
      toDate: fromDateApi,
      period: 'AM',
      suspensions: [
        {
          bookingId: 1133341,
          offenderNo: 'G8974UK',
          eventId: 3,
          cellLocation: `${agencyId}-1`,
          startTime: '2010-10-10T10:00:00',
          timeSlot: 'AM',
          firstName: 'Adam',
          lastName: 'Smith',
          comment: 'Cleaner',
          suspended: true,
        },
      ],
    })
    cy.task('stubOffenderSuspendedActivitiesOverDateRange', {
      agencyId,
      fromDate: fromDateApi,
      toDate: fromDateApi,
      period: 'PM',
      suspensions: [
        {
          bookingId: 1133342,
          offenderNo: 'G8975UK',
          eventId: 4,
          cellLocation: `${agencyId}-2`,
          startTime: '2010-10-10T14:00:00',
          timeSlot: 'PM',
          firstName: 'Offender',
          lastName: 'Two',
          comment: 'Cleaner',
          suspended: true,
        },
        {
          bookingId: 1133343,
          offenderNo: 'G8976UK',
          eventId: 5,
          cellLocation: `${agencyId}-3`,
          startTime: '2010-10-10T15:00:00',
          timeSlot: 'PM',
          firstName: 'Offender',
          lastName: 'Three',
          comment: 'Cleaner',
          suspended: true,
        },
      ],
    })
    cy.task('stubAttendanceForBookings', {
      agencyId,
      fromDate: fromDateApi,
      toDate: fromDateApi,
      period: '',
      attendances: {
        attendances: [
          {
            eventId: 3,
            bookingId: 1133341,
            eventDate: '2010-10-10',
            attended: false,
            paid: true,
            absentReason: 'AcceptableAbsence',
            comments: 'Asked nicely.',
          },
          {
            eventId: 4,
            bookingId: 1133342,
            eventDate: '2010-10-10',
            attended: false,
            paid: false,
            absentReason: 'Refused',
            comments: 'Did not ask nicely',
          },
          {
            eventId: 5,
            bookingId: 1133343,
            eventDate: '2010-10-10',
            attended: true,
            paid: true,
            absentReason: undefined,
            comments: '',
          },
        ],
      },
    })
  })

  it('The suspended count matches the count on the suspended page', () => {
    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=MDI&period=${period}&fromDate=${fromDate}`
    )
    const attendanceStatsPage = AttendanceStatsPage.verifyOnPage()
    attendanceStatsPage.suspended().contains('3')
    attendanceStatsPage.suspended().click()
    cy.url().should('include', 'suspended')
    const attendanceStatsSuspendedPage = AttendanceStatsSuspendedPage.verifyOnPage()
    attendanceStatsSuspendedPage.timespan().should('have.text', '10 October 2010 - AM and PM')
    attendanceStatsSuspendedPage.numberOfSuspensions().should('have.text', 'Number of suspensions: 3')
    attendanceStatsSuspendedPage.offenderCount().should('have.text', 'Prisoners listed: 3')
  })
})
