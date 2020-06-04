const AttendanceChangesPage = require('../../pages/attendance/attendanceChangesPage')

context('A user can view attendance changes', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()
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
    cy.task('stubScheduledActivities', [
      { eventId: 1, comment: 'Houseblock 1', firstName: 'bob', lastName: 'sut', offenderNo: 'A123456' },
    ])

    const fromDateTime = '2010-10-10T10:00'
    const toDateTime = '2010-10-10T17:00'
    const subHeading = 'test'
    const agencyId = 'WWI'
    cy.visit(
      `/attendance-changes?agencyId=${agencyId}&fromDateTime=${fromDateTime}&toDateTime=${toDateTime}&subHeading=${subHeading}`
    )
  })

  it('A user can view attendance changes for specific date and agency', () => {
    const attendanceChangesPage = AttendanceChangesPage.verifyOnPage()
    const tableDataRow = attendanceChangesPage.getChangesRows(0)
    tableDataRow.name().contains('Sut, Bob')
    tableDataRow.prisonNo().contains('A123456')
    tableDataRow.activity().contains('Houseblock 1')
    tableDataRow.changedFrom().contains('Attended')
    tableDataRow.changedTo().contains('Refused')
    tableDataRow.dateAndTime().contains('10 October 2010 - 20:00')
    tableDataRow.changedBy().contains('ITAG_USER name')
  })
})
