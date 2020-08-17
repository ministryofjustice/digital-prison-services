const moment = require('moment')

const ReverseCohortingUnitPage = require('../../pages/covid/reverseCohortingUnitPage')
const NotInUnitPage = require('../../pages/covid/notInUnitPage')

const alert = val => ({ alerts: { equalTo: val } })
const dayBeforeYesterday = moment().subtract(2, 'day')

context('A user can view the protective isolation list', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })

    cy.login()

    cy.task('stubAlerts', {
      locationId: 'MDI',
      alerts: [
        {
          offenderNo: 'AA1234A',
          alertCode: 'URCU',
          dateCreated: dayBeforeYesterday.format('YYYY-MM-DD'),
        },
        { offenderNo: 'BB1234A', alertCode: 'AA1', dateCreated: '2020-01-02' },
        { offenderNo: 'BB1234A', alertCode: 'URCU', dateCreated: '2020-01-03' },
        { offenderNo: 'CC1234A', alertCode: 'AA2', dateCreated: '2020-01-03' },
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

    cy.task('stubAlerts', {
      locationId: 'MDI',
      alerts: [
        {
          offenderNo: 'BB1234A',
          alertCode: 'BBB',
          dateCreated: dayBeforeYesterday.format('YYYY-MM-DD'),
        },
      ],
    })

    cy.task('stubMovementsBetween', {
      locationId: 'MDI',
      fromDate: moment()
        .startOf('day')
        .subtract(14, 'days')
        .format('YYYY-MM-DDTHH:mm:ss'),
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
          offenderNo: 'BB1234A',
          bookingId: 234,
          location: '1-2-018',
          firstName: 'DONNA',
          lastName: 'READ',
          movementDateTime: '2020-01-05',
        },
      ],
    })
  })

  it('A user can view the shielding list', () => {
    const reverseCohortingUnitPage = ReverseCohortingUnitPage.goTo()
    reverseCohortingUnitPage.notInUnitLink().click()

    const notInUnitPage = NotInUnitPage.verifyOnPage()
    notInUnitPage.prisonerCount().contains(2)

    {
      const { prisoner, prisonNumber, location, arrivalDate } = notInUnitPage.getRow(0)

      prisoner().contains('Read, Donna')
      prisonNumber().contains('BB1234A')
      location().contains('1-2-018')
      arrivalDate().contains('5 January 2020')
    }

    {
      const { prisoner, prisonNumber, location, arrivalDate } = notInUnitPage.getRow(1)

      prisoner().contains('Stewart, James')
      prisonNumber().contains('AA1234A')
      location().contains('1-2-017')
      arrivalDate().contains('4 January 2020')
    }
  })
})
