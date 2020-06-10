const AttendanceChangesPage = require('../../pages/attendance/attendanceChangesPage')

const caseload = 'WWI'
const date = new Date().toISOString().split('T')[0]

context('Activity list page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload })
    cy.login()
    cy.task('stubActivityLocations')

    // cy.task('stubScheduledActivities', [
    //   { eventId: 1, comment: 'Houseblock 1', firstName: 'bob', lastName: 'sut', offenderNo: 'A123456' },
    // ])
    const offenders = [
      {
        bookingId: 1,
        offenderNo: 'A1234AA',
      },
      {
        bookingId: 2,
        offenderNo: 'A1234AC',
      },
      {
        bookingId: 3,
        offenderNo: 'A1234AB',
      },
      {
        bookingId: 4,
        offenderNo: 'A1234AA',
      },
      {
        bookingId: 5,
        offenderNo: 'A1234AA',
      },
    ]
    offenders.forEach(offender => {
      cy.task('stubOffenderBasicDetails', offender)
    })
    cy.task('stubGetActivityList', caseload, 2, 'AM', date)
  })

  it('A user can view the activity list', () => {
    cy.task('stubGetAbsenceReasons')
    cy.task('stubGetAttendance', caseload, 2, 'AM', date)
    cy.visit(`/manage-prisoner-whereabouts`)
  })
})
