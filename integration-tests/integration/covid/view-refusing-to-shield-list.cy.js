const moment = require('moment')

const RefusingToShieldPage = require('../../pages/covid/refusingToShieldPage')

const alert = (val) => ({ alerts: { equalTo: val } })

const dayBeforeYesterday = moment().subtract(2, 'day')

context('A user can view the refusing to shield list', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()

    cy.task('stubGetAlerts', {
      locationId: 'MDI',
      alerts: [
        { prisonNumber: 'AA1234A', alertCode: { code: 'AA1' }, createdAt: '2020-01-02', isActive: true },
        { prisonNumber: 'AA1234A', alertCode: { code: 'URS' }, createdAt: moment().format('YYYY-MM-DD'), isActive: true },
        {
          prisonNumber: 'BB1234A',
          alertCode: { code: 'URS' },
          createdAt: dayBeforeYesterday.format('YYYY-MM-DD'),
          isActive: true
        },
      ],
    })

    cy.task('stubInmates', {
      locationId: 'MDI',
      params: alert('URS'),
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
    const refusingToShieldPage = RefusingToShieldPage.goTo()
    refusingToShieldPage.prisonerCount().contains(2)

    {
      const { prisoner, prisonNumber, location } = refusingToShieldPage.getRow(0)

      prisoner().contains('Read, Donna')
      prisonNumber().contains('BB1234A')
      location().contains('1-2-018')
    }

    {
      const { prisoner, prisonNumber, location } = refusingToShieldPage.getRow(1)

      prisoner().contains('Stewart, James')
      prisonNumber().contains('AA1234A')
      location().contains('1-2-017')
    }
  })
})
