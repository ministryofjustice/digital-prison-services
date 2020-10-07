const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

context('Prisoner schedule', () => {
  const longDateFormat = 'dddd D MMMM YYYY'
  const offenderNo = 'A1234A'

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  context('Basic page functionality', () => {
    const today = moment()
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
      cy.task('stubSchedule', {
        offenderBasicDetails,
        thisWeeksSchedule: [
          {
            bookingId: 1200961,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'GYMF',
            eventSubTypeDesc: 'Gym - Football',
            eventDate: today.format('YYYY-MM-DD'),
            startTime: moment(today)
              .set('hour', 16)
              .set('minute', 30)
              .set('seconds', 0)
              .format('YYYY-MM-DDTHH:mm:ss'),
            endTime: moment(today)
              .set('hour', 17)
              .set('minute', 30)
              .set('seconds', 0)
              .format('YYYY-MM-DDTHH:mm:ss'),
            eventLocation: 'FOOTBALL',
            eventSource: 'APP',
            eventSourceCode: 'APP',
            eventSourceDesc: 'Test',
          },
          {
            bookingId: 1200961,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'MEDE',
            eventSubTypeDesc: 'Medical - Dentist',
            eventDate: moment(today)
              .add(1, 'day')
              .format('YYYY-MM-DD'),
            startTime: moment(today)
              .add(1, 'day')
              .set('hour', 8)
              .set('minute', 0)
              .set('seconds', 0)
              .format('YYYY-MM-DDTHH:mm:ss'),
            endTime: moment(today)
              .add(1, 'day')
              .set('hour', 9)
              .set('minute', 0)
              .set('seconds', 0)
              .format('YYYY-MM-DDTHH:mm:ss'),
            eventLocation: 'HEALTH CARE',
            eventSource: 'APP',
            eventSourceCode: 'APP',
          },
          {
            bookingId: 1200961,
            eventClass: 'INT_MOV',
            eventStatus: 'SCH',
            eventType: 'APP',
            eventTypeDesc: 'Appointment',
            eventSubType: 'CHAP',
            eventSubTypeDesc: 'Chaplaincy',
            eventDate: moment(today)
              .add(2, 'days')
              .format('YYYY-MM-DD'),
            startTime: moment(today)
              .add(2, 'days')
              .set('hour', 20)
              .set('minute', 0)
              .set('seconds', 0)
              .format('YYYY-MM-DDTHH:mm:ss'),
            endTime: moment(today)
              .add(2, 'days')
              .set('hour', 21)
              .set('minute', 0)
              .set('seconds', 0)
              .format('YYYY-MM-DDTHH:mm:ss'),
            eventLocation: 'CHAPEL',
            eventSource: 'APP',
            eventSourceCode: 'APP',
          },
        ],
      })
    })

    context('when viewing current weeks schedule', () => {
      it('should show the correct dates in the title and link', () => {
        cy.visit(`/prisoner/${offenderNo}/schedule`)

        cy.get('h1').should('have.text', 'John Smith’s schedule')
        cy.get('[data-test="schedule-dates"]').should(
          'contain.text',
          `${moment().format(longDateFormat)} to ${moment()
            .add(6, 'days')
            .format(longDateFormat)}`
        )
        cy.get('[data-test="schedule-select-week"]').should(
          'contain.text',
          `View 7 days from ${moment()
            .add(1, 'week')
            .format('D MMMM YYYY')}`
        )
      })

      it('should display the correct days', () => {
        cy.get('[data-test="schedule-day"]').then($days => {
          cy.get($days)
            .its('length')
            .should('eq', 7)
          cy.get($days).each(($el, index) => {
            if (index === 0) {
              cy.get($el).should('contain.text', moment().format(longDateFormat))
            } else {
              cy.get($el).should(
                'contain.text',
                moment()
                  .add(index, 'days')
                  .format(longDateFormat)
              )
            }
          })
        })
      })

      it('should show the correct events and text when there are no events', () => {
        cy.get('[data-test="schedule-morning-events"]').then($events => {
          cy.get($events)
            .its('length')
            .should('eq', 7)
          expect($events.get(0).innerText).to.contain('Nothing scheduled')
          expect($events.get(1).innerText).to.contain('Medical - Dentist\n08:00 to 09:00')
        })
        cy.get('[data-test="schedule-afternoon-events"]').then($events => {
          cy.get($events)
            .its('length')
            .should('eq', 7)
          expect($events.get(0).innerText).to.contain('Gym - Football - Test\n16:30 to 17:30')
          expect($events.get(1).innerText).to.contain('Nothing scheduled')
        })
        cy.get('[data-test="schedule-evening-events"]').then($events => {
          cy.get($events)
            .its('length')
            .should('eq', 7)
          expect($events.get(0).innerText).to.contain('Nothing scheduled')
          expect($events.get(1).innerText).to.contain('Nothing scheduled')
          expect($events.get(2).innerText).to.contain('Chaplaincy\n20:00 to 21:00')
        })
      })
    })

    context('when viewing next weeks schedule', () => {
      it('should show the correct dates in the title and link', () => {
        cy.visit(`/prisoner/${offenderNo}/schedule`)
        cy.get('[data-test="schedule-select-week"]').click()

        cy.get('h1').should('have.text', 'John Smith’s schedule')
        cy.get('[data-test="schedule-dates"]').should(
          'contain.text',
          `${moment()
            .add(1, 'week')
            .format(longDateFormat)} to ${moment()
            .add(13, 'days')
            .format(longDateFormat)}`
        )
        cy.get('[data-test="schedule-select-week"]').should('contain.text', 'View 7 days from today')
      })

      it('should display the correct days', () => {
        cy.get('[data-test="schedule-day"]').then($days => {
          cy.get($days)
            .its('length')
            .should('eq', 7)
          cy.get($days).each(($el, index) => {
            if (index === 0) {
              cy.get($el).should(
                'contain.text',
                moment()
                  .add(1, 'week')
                  .format(longDateFormat)
              )
            } else {
              cy.get($el).should(
                'contain.text',
                moment()
                  .add(index + 7, 'days')
                  .format(longDateFormat)
              )
            }
          })
        })
      })
    })
  })
})
