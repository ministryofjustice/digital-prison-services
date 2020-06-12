const moment = require('moment')

const ViewReverseCohortingListPage = require('../../pages/covid/viewReverseCohortingUnitPage')

const alert = val => ({ alerts: { equalTo: val } })

const dayBeforeYesterday = moment().subtract(2, 'day')
const dayBeforeYesterdayOverDue = moment(dayBeforeYesterday).add(14, 'day')

context('A user can view the reverse cohorting list', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()

    cy.task('stubAlerts', {
      locationId: 'MDI',
      alerts: [
        { offenderNo: 'AA1234A', alertCode: 'AA1', dateCreated: '2020-01-02' },
        { offenderNo: 'AA1234A', alertCode: 'URCU', dateCreated: '2020-01-03' },
        {
          offenderNo: 'BB1234A',
          alertCode: 'URCU',
          dateCreated: dayBeforeYesterday.format('YYYY-MM-DD'),
        },
      ],
    })

    cy.task('stubInmates', {
      locationId: 'MDI',
      params: alert('URCU'),
      count: 3,
      data: [
        {
          offenderNo: 'AA1234A',
          bookingId: 123,
          assignedLivingUnitDesc: '1-2-017',
          firstName: 'JAMES',
          lastName: 'STEWART',
        },
        {
          offenderNo: 'BB1234A',
          bookingId: 234,
          assignedLivingUnitDesc: '1-2-018',
          firstName: 'DONNA',
          lastName: 'READ',
        },
      ],
    })
  })

  it('A user can view the reverse cohorting list', () => {
    const viewReverseCohortingListPage = ViewReverseCohortingListPage.goTo()
    viewReverseCohortingListPage.prisonerCount().contains(2)

    {
      const { prisoner, prisonNumber, location, dateAdded, dateOverdue, overdue } = viewReverseCohortingListPage.getRow(
        0
      )

      prisoner().contains('Stewart, James')
      prisonNumber().contains('AA1234A')
      location().contains('1-2-017')
      dateAdded().contains('3 Jan 2020')
      dateOverdue().contains('17 Jan 2020')
      overdue().should('be.visible')
    }

    {
      const { prisoner, prisonNumber, location, dateAdded, dateOverdue, overdue } = viewReverseCohortingListPage.getRow(
        1
      )

      prisoner().contains('Read, Donna')
      prisonNumber().contains('BB1234A')
      location().contains('1-2-018')
      dateAdded().contains(dayBeforeYesterday.format('D MMM YYYY'))
      dateOverdue().contains(dayBeforeYesterdayOverDue.format('D MMM YYYY'))
      overdue().should('not.be.visible')
    }
  })
})
