const moment = require('moment')

const ShieldingUnitPage = require('../../pages/covid/shieldingUnitPage')

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
        { offenderNo: 'AA1234A', alertCode: 'AA1', dateCreated: '2020-01-02' },
        { offenderNo: 'AA1234A', alertCode: 'USU', dateCreated: moment().format('YYYY-MM-DD') },
        {
          offenderNo: 'BB1234A',
          alertCode: 'USU',
          dateCreated: dayBeforeYesterday.format('YYYY-MM-DD'),
        },
      ],
    })

    cy.task('stubInmates', {
      locationId: 'MDI',
      params: alert('USU'),
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

  it('A user can view the shielding list', () => {
    const shieldingUnitPage = ShieldingUnitPage.goTo()
    shieldingUnitPage.prisonerCount().contains(2)

    {
      const { prisoner, prisonNumber, location, dateAdded } = shieldingUnitPage.getRow(0)

      prisoner().contains('Read, Donna')
      prisonNumber().contains('BB1234A')
      location().contains('1-2-018')
      dateAdded().contains(dayBeforeYesterday.format('D MMMM YYYY'))
    }

    {
      const { prisoner, prisonNumber, location, dateAdded } = shieldingUnitPage.getRow(1)

      prisoner().contains('Stewart, James')
      prisonNumber().contains('AA1234A')
      location().contains('1-2-017')
      dateAdded().contains(moment().format('D MMMM YYYY'))
    }
  })
})
