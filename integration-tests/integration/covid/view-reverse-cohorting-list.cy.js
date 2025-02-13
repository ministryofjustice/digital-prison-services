const moment = require('moment')

const ReverseCohortingUnitPage = require('../../pages/covid/reverseCohortingUnitPage')

const alert = (val) => ({ alerts: { equalTo: val } })

const dayBeforeYesterday = moment().subtract(2, 'day')
const dayBeforeYesterdayOverDue = moment(dayBeforeYesterday).add(14, 'day')

context('A user can view the reverse cohorting list', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()

    cy.task('stubGetAlerts', {
      locationId: 'MDI',
      alerts: [
        {
          prisonNumber: 'AA1234A',
          alertCode: { code: 'URCU' },
          createdAt: dayBeforeYesterday.format('YYYY-MM-DD'),
          isActive: true,
        },
        { prisonNumber: 'BB1234A', alertCode: { code: 'AA1' }, createdAt: '2020-01-02', isActive: true },
        { prisonNumber: 'BB1234A', alertCode: { code: 'URCU' }, createdAt: '2020-01-03', isActive: true },
        { prisonNumber: 'CC1234A', alertCode: { code: 'AA2' }, createdAt: '2020-01-03', isActive: true },
      ],
    })

    cy.task('stubInmates', {
      locationId: 'MDI',
      params: alert('URCU'),
      count: 3,
      data: [
        {
          offenderNo: 'BB1234A',
          bookingId: 123,
          assignedLivingUnitDesc: '1-2-017',
          firstName: 'JAMES',
          lastName: 'STEWART',
        },
        {
          offenderNo: 'AA1234A',
          bookingId: 234,
          assignedLivingUnitDesc: '1-2-018',
          firstName: 'DONNA',
          lastName: 'READ',
        },
      ],
    })

    cy.task('stubMovementsBetween', {
      locationId: 'MDI',
      fromDate: moment().startOf('day').subtract(14, 'days').format('YYYY-MM-DDTHH:mm:ss'),
      movements: [
        {
          offenderNo: 'AA1234A',
          bookingId: 123,
          location: '1-2-017',
          firstName: 'JAMES',
          lastName: 'STEWART',
          movementDateTime: '2020-01-04',
        },
        {
          offenderNo: 'CC1234A',
          bookingId: 234,
          location: '1-2-018',
          firstName: 'BOB',
          lastName: 'SMITH',
          movementDateTime: '2020-01-05',
        },
        {
          offenderNo: 'DD1234A',
          bookingId: 234,
          location: '1-2-018',
          firstName: 'JIM',
          lastName: 'SMITH',
          movementDateTime: '2020-01-05',
        },
      ],
    })
  })

  it('A user can view the reverse cohorting list', () => {
    const reverseCohortingUnitPage = ReverseCohortingUnitPage.goTo()
    reverseCohortingUnitPage.prisonerCount().contains(2)
    reverseCohortingUnitPage
      .notInUnit()
      .contains('There are 2 newly arrived prisoners who have not been added to this unit')
    {
      const { prisoner, prisonNumber, location, dateAdded, dateOverdue, overdue } = reverseCohortingUnitPage.getRow(0)

      prisoner().contains('Stewart, James')
      prisonNumber().contains('BB1234A')
      location().contains('1-2-017')
      dateAdded().contains('3 January 2020')
      dateOverdue().contains('17 January 2020')
      overdue().should('be.visible')
    }

    {
      const { prisoner, prisonNumber, location, dateAdded, dateOverdue, overdue } = reverseCohortingUnitPage.getRow(1)

      prisoner().contains('Read, Donna')
      prisonNumber().contains('AA1234A')
      location().contains('1-2-018')
      dateAdded().contains(dayBeforeYesterday.format('D MMMM YYYY'))
      dateOverdue().contains(dayBeforeYesterdayOverDue.format('D MMMM YYYY'))
      overdue().should('not.exist')
    }
  })

  it('check name sort', () => {
    const reverseCohortingUnitPage = ReverseCohortingUnitPage.goTo()
    reverseCohortingUnitPage.prisonerCount().contains(2)

    reverseCohortingUnitPage.nameSort().click()

    {
      const { prisoner: prisoner1 } = reverseCohortingUnitPage.getRow(0)
      const { prisoner: prisoner2 } = reverseCohortingUnitPage.getRow(1)

      prisoner1().contains('Read, Donna')
      prisoner2().contains('Stewart, James')
    }

    reverseCohortingUnitPage.nameSort().click()

    {
      const { prisoner: prisoner1 } = reverseCohortingUnitPage.getRow(0)
      const { prisoner: prisoner2 } = reverseCohortingUnitPage.getRow(1)

      prisoner1().contains('Stewart, James')
      prisoner2().contains('Read, Donna')
    }
  })
})
