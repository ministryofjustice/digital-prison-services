const AttendanceStatsSuspendedPage = require('../../pages/attendance/attendanceStatsSuspendedPage')

const fromDateApi = '2010-10-10'
const fromDate = '10/10/2010'
const toDateApi = '2010-10-11'
const toDate = '11/10/2010'
const period = 'AM'
const agencyId = 'WWI'

const toSuspension = ($cell) => ({
  name: $cell[0]?.textContent,
  offenderNo: $cell[1]?.textContent,
  location: $cell[2]?.textContent,
  activity: $cell[3]?.textContent,
  attended: $cell[4]?.textContent,
})

context('A user can view suspensions', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.signIn()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubUserMeRoles')
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubOffenderActivitiesOverDateRange', {
      agencyId,
      fromDate: fromDateApi,
      toDate: toDateApi,
      period,
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
          eventId: 4,
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
      toDate: toDateApi,
      period,
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
            eventId: 4,
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

  it('Shows the suspensions correctly', () => {
    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics/suspended?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${toDate}`
    )

    const attendanceStatsSuspendedPage = AttendanceStatsSuspendedPage.verifyOnPage()

    attendanceStatsSuspendedPage.timespan().should('have.text', '10 October 2010 to 11 October 2010 - AM')
    attendanceStatsSuspendedPage.numberOfSuspensions().should('have.text', 'Number of suspensions: 3')
    attendanceStatsSuspendedPage.offenderCount().should('have.text', 'Prisoners listed: 3')

    attendanceStatsSuspendedPage.offenderList().then(($table) => {
      cy.get($table)
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 4) // 2 results plus table header

          const suspensions = Array.from($tableRows).map(($row) => toSuspension($row.cells))

          expect(suspensions[1].name).to.contain('Smith, Adam')
          expect(suspensions[1].offenderNo).to.eq('G8974UK')
          expect(suspensions[1].location).to.eq('WWI-1')
          expect(suspensions[1].activity).to.contain('Cleaner')
          expect(suspensions[1].attended).to.contain('Yes - acceptable absence')
          expect(suspensions[2].name).to.contain('Two, Offender')
          expect(suspensions[2].offenderNo).to.eq('G8975UK')
          expect(suspensions[2].location).to.eq('WWI-2')
          expect(suspensions[2].activity).to.contain('Cleaner')
          expect(suspensions[2].attended).to.contain('No - refused')
          expect(suspensions[3].name).to.contain('Three, Offender')
          expect(suspensions[3].offenderNo).to.eq('G8976UK')
          expect(suspensions[3].location).to.eq('WWI-3')
          expect(suspensions[3].activity).to.contain('Cleaner')
          expect(suspensions[3].attended).to.contain('Yes')
        })
    })
  })

  it('Shows no data when no suspensions are found', () => {
    cy.task('stubOffenderActivitiesOverDateRange', {
      agencyId,
      fromDate: fromDateApi,
      toDate: toDateApi,
      period,
      suspensions: [],
    })
    cy.task('stubAttendanceForBookings', {
      agencyId,
      fromDate: fromDateApi,
      toDate: toDateApi,
      period,
      attendances: {
        attendances: [],
      },
    })

    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics/suspended?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${toDate}`
    )

    const attendanceStatsSuspendedPage = AttendanceStatsSuspendedPage.verifyOnPage()

    attendanceStatsSuspendedPage.offenderList().then(($table) => {
      cy.get($table).find('tr').its('length').should('eq', 1)
    })
  })
})
