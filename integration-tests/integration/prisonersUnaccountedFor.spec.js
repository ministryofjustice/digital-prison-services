const queryString = require('query-string')
const moment = require('moment')

const datePickerDriver = require('../componentDrivers/datePickerDriver')
const attendanceDialogDriver = require('../componentDrivers/attendanceDialogDriver')

const pageUrl = '/manage-prisoner-whereabouts/prisoners-unaccounted-for'

const offenderNo1 = 'A12345'
const offenderNo2 = 'A12346'

const toOffender = ($cell) => ({
  name: $cell[0]?.textContent,
  location: $cell[1]?.textContent,
  prisonNo: $cell[2]?.textContent,
  activities: $cell[3]?.textContent,
  otherActivities: $cell[4]?.textContent,
})

const setupAttendanceDialog = (verifyOnPage) => {
  cy.server()
  cy.route('POST', /.\/api\/attendance*/).as('request')

  cy.visit(pageUrl)

  verifyOnPage()

  const event = 1

  const today = moment()

  datePickerDriver(cy).pickDate(today.date(), today.month(), today.year())

  cy.get('[data-qa="other-option"')
    .find(`input[name="${offenderNo1 + event}"]`)
    .click()
  return today
}

context('Prisoners unaccounted for', () => {
  const verifyOnPage = () => {
    cy.get('h1').contains('Prisoners unaccounted for')
    cy.get('[data-qa="print-button"]')
  }

  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: [{ roleCode: 'ACTIVITY_HUB' }] })
    cy.signIn()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')

    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')

    cy.task('stubPrisonersUnaccountedFor', [
      {
        eventId: 1,
        bookingId: -1,
        offenderNo: offenderNo1,
        firstName: 'Bob',
        lastName: 'Doe',
        cellLocation: 'MDI-1-1',
        startTime: `${yesterday}T10:00:00`,
        eventType: 'PA',
        comment: 'Wing cleaner 1',
      },
      {
        eventId: 2,
        bookingId: -2,
        offenderNo: offenderNo2,
        firstName: 'Dave',
        lastName: 'Doe',
        cellLocation: 'MDI-1-2',
        startTime: `${yesterday}T10:10:00`,
        eventType: 'PA',
        comment: 'Wing cleaner 2',
      },
    ])
    cy.task('stubVisits', [
      {
        offenderNo: offenderNo1,
        startTime: `${yesterday}T10:00:00`,
        eventDescription: 'Social visit',
      },
    ])
    cy.task('stubAppointments', [
      {
        offenderNo: offenderNo2,
        startTime: `${yesterday}T10:00:00`,
        eventDescription: 'Dentist',
      },
    ])
    cy.task('stubGetAbsenceReasons')
  })

  it('should display data for today', () => {
    cy.visit(pageUrl)

    verifyOnPage()

    cy.get('[data-qa="result-row"]').then(() => {
      cy.get('[data-qa="results-table"]')
        .find('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 2)

          const offenders = Array.from($tableRows).map(($row) => toOffender($row.cells))

          expect(offenders[0].name).to.eq('Doe, Bob')
          expect(offenders[0].location).to.eq('1-1')
          expect(offenders[0].prisonNo).to.eq(offenderNo1)
          expect(offenders[0].activities).to.eq('10:00 - Wing cleaner 1')
          expect(offenders[0].otherActivities).to.eq('10:00 - Social visit')

          expect(offenders[1].name).to.eq('Doe, Dave')
          expect(offenders[1].location).to.eq('1-2')
          expect(offenders[1].prisonNo).to.eq(offenderNo2)
          expect(offenders[1].activities).to.eq('10:10 - Wing cleaner 2')
          expect(offenders[1].otherActivities).to.eq('10:00 - Dentist')
        })
    })
  })

  it('should make a request using current date', () => {
    cy.server()
    cy.route('GET', /.*prisoners-unaccounted-for.*/).as('request')

    cy.visit(pageUrl)
      .wait('@request')
      .then((xhr) => {
        const queryStringStartIndex = xhr?.url?.indexOf('?') + 1
        const { agencyId, date } = queryString.parse(xhr.url.substring(queryStringStartIndex))

        expect(date).to.eq(moment().format('DD/MM/YYYY'))
        expect(agencyId).to.eq('MDI')
      })
  })

  it('should make a request using new date selection', () => {
    cy.server()
    cy.route('GET', /.*prisoners-unaccounted-for.*/).as('request')

    cy.visit(pageUrl)
      .wait('@request')
      .then(() => {
        datePickerDriver(cy).pickDate(2, 0, 2020)

        cy.wait('@request').then((xhr) => {
          const queryStringStartIndex = xhr?.url?.indexOf('?') + 1
          const { agencyId, date } = queryString.parse(xhr.url.substring(queryStringStartIndex))

          expect(date).to.eq('02/01/2020')
          expect(agencyId).to.eq('MDI')
        })
      })
  })

  it('should make request to mark someone as attended', () => {
    cy.server()
    cy.route('POST', /.\/api\/attendance*/).as('request')

    cy.visit(pageUrl)

    verifyOnPage()

    const event = 1

    cy.get('[data-qa="pay-option"')
      .find(`input[name="${offenderNo1 + event}"]`)
      .click()

    cy.wait('@request').then((xhr) => {
      const requestBody = xhr.request.body

      expect(requestBody.attended).to.eq(true)
      expect(requestBody.bookingId).to.eq(-1)
      expect(requestBody.eventDate).to.eq(moment().format('DD/MM/YYYY'))
      expect(requestBody.eventId).to.eq(1)
      expect(requestBody.offenderNo).to.eq(offenderNo1)
      expect(requestBody.paid).to.eq(true)
      expect(requestBody.prisonId).to.eq('MDI')
    })
  })

  it('should make request to not pay someone without sub reason required', () => {
    setupAttendanceDialog(verifyOnPage)

    attendanceDialogDriver(cy).markAbsence({ pay: 'yes', absentReason: 'NotRequired' })

    cy.wait('@request').then((xhr) => {
      const requestBody = xhr.request.body

      expect(requestBody.absentReason).to.eq('NotRequired')
      expect(requestBody.absentSubReason).to.eq(undefined)
      expect(requestBody.comments).to.eq('test')
      expect(requestBody.paid).to.eq(true)
    })
  })

  it('should make require sub reason for some absence reasons', () => {
    setupAttendanceDialog(verifyOnPage)

    attendanceDialogDriver(cy).markAbsence({ pay: 'no', absentReason: 'Refused', iep: 'no' })

    verifyOnPage()

    cy.get("[data-test='error-summary']").contains('There is a problem')
    cy.get("[data-test='error-summary']")
      .find('li')
      .then(($errors) => {
        expect($errors.get(0).innerText).to.contain('Select an absence reason')
      })

    attendanceDialogDriver(cy).markAbsence({
      pay: 'no',
      absentReason: 'Refused',
      iep: 'no',
      absentSubReason: 'Healthcare',
    })

    cy.wait('@request').then((xhr) => {
      const requestBody = xhr.request.body

      expect(requestBody.absentReason).to.eq('Refused')
      expect(requestBody.absentSubReason).to.eq('Healthcare')
      expect(requestBody.comments).to.eq('testtest')
      expect(requestBody.paid).to.eq(false)
    })
  })

  it('should make request to mark someone as not attended', () => {
    const today = setupAttendanceDialog(verifyOnPage)

    attendanceDialogDriver(cy).markAbsence({
      pay: 'yes',
      absentReason: 'AcceptableAbsence',
      absentSubReason: 'Courses',
    })

    cy.wait('@request').then((xhr) => {
      const requestBody = xhr.request.body

      expect(requestBody.absentReason).to.eq('AcceptableAbsence')
      expect(requestBody.absentSubReason).to.eq('Courses')
      expect(requestBody.attended).to.eq(false)
      expect(requestBody.bookingId).to.eq(-1)
      expect(requestBody.comments).to.eq('test')
      expect(requestBody.eventDate).to.eq(today.format('DD/MM/YYYY'))
      expect(requestBody.eventId).to.eq(1)
      expect(requestBody.offenderNo).to.eq(offenderNo1)
      expect(requestBody.paid).to.eq(true)
      expect(requestBody.prisonId).to.eq('MDI')
    })
  })
})
