const searchPage = require('../../pages/whereabouts/searchPage')
const HouseblockPage = require('../../pages/whereabouts/houseblockPage')

const caseload = 'MDI'
const date = new Date().toISOString().split('T')[0]

context('Activity list page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubGroups', { id: caseload })
    cy.task('stubLogin', { username: 'ITAG_USER', caseload })
    cy.login()
    cy.task('stubActivityLocations')
    cy.task('stubGetAgencyGroupLocations', { agencyId: caseload, groupName: 1 })
    cy.task('stubGetEventsByLocationIds', [
      {
        offenderNo: 'A1234AA',
        bookingId: 1,
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: 'LEI-A-1-1',
        event: 'PA',
        eventType: 'PRISON_ACT',
        eventDescription: 'Prison Activities',
        eventId: 10,
        eventLocationId: 100,
        comment: 'Woodwork',
        startTime: '2017-10-15T17:00:00',
        payRate: 1.3,
        endTime: '2017-10-15T18:30:00',
      },
      {
        offenderNo: 'A1234AA',
        bookingId: 2,
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: 'LEI-A-1-1',
        event: 'VISIT',
        eventType: 'VISIT',
        eventDescription: 'Visits',
        comment: 'Friends',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
      },
      {
        offenderNo: 'A1234AA',
        bookingId: 2,
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: 'LEI-A-1-1',
        event: 'VISIT',
        eventType: 'VISIT',
        eventStatus: 'CANC',
        eventDescription: 'Visits',
        comment: 'Friends',
        startTime: '2017-10-15T18:30:00',
        endTime: '2017-10-15T18:45:00',
      },
      {
        offenderNo: 'A1234AB',
        bookingId: 3,
        firstName: 'EUGENE',
        lastName: 'BALOG',
        cellLocation: 'LEI-A-1-2',
        event: 'PA',
        eventDescription: 'Prison Activities',
        eventType: 'PRISON_ACT',
        eventId: 20,
        eventLocationId: 200,
        comment: 'TV Repairs',
        startTime: '2017-10-15T17:45:00',
        endTime: '2017-10-15T18:30:00',
      },
      {
        offenderNo: 'A1234AC',
        bookingId: 4,
        firstName: 'FRED',
        lastName: 'BAA',
        cellLocation: 'LEI-A-1-3',
        event: 'PA',
        eventDescription: 'Prison Activities',
        eventType: 'PRISON_ACT',
        eventId: 40,
        eventLocationId: 400,
        comment: 'Chapel',
        startTime: '2017-10-15T11:45:00',
        endTime: '2017-10-15T13:30:00',
      },
      {
        offenderNo: 'A1234AA',
        bookingId: 8,
        firstName: 'JOHN',
        lastName: 'JAMES',
        cellLocation: 'LEI-A-1-12',
        event: 'HC',
        eventType: 'APP',
        eventDescription: 'hair cut',
        eventLocation: 'room 1',
        comment: 'crew cut',
        startTime: '2017-10-15T19:10:00',
        endTime: '2017-10-15T20:30:00',
      },
    ])
    cy.task('stubPostAttendance')
    cy.task('stubSentenceData')
    cy.task('stubCourtEvents')
    cy.task('stubExternalTransfers')
    cy.task('stubAlerts')
    cy.task('stubAssessments')

    cy.task('stubGetAbsenceReasons')
  })

  it('Displays the houseblock list', () => {
    cy.visit(`/manage-prisoner-whereabouts`)
    const sPage = searchPage.verifyOnPage()

    sPage.period().select('AM')
    sPage.location().select('1')
    sPage.continueActivityButton().click()

    const houseblockPage = HouseblockPage.verifyOnPage('1')
    houseblockPage.printButton().should('have.length', 1)
  })
})
