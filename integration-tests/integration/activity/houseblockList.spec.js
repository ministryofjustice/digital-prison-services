/* eslint-disable no-unused-expressions */
const searchPage = require('../../pages/whereabouts/searchPage')
const HouseblockPage = require('../../pages/whereabouts/houseblockPage')

const caseload = 'MDI'
const date = new Date().toISOString().split('T')[0]

context('Houseblock list page list page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload })
    cy.login()
    cy.task('stubGroups', { id: caseload })
    cy.task('stubActivityLocations')
    cy.task('stubGetAgencyGroupLocations', { agencyId: caseload, groupName: 1, response: [1] })
    cy.task('stubGetAttendancesForBookings', {
      agencyId: caseload,
      date,
      timeSlot: 'AM',
      data: {
        attendances: [
          {
            id: 1,
            attended: true,
            bookingId: 1,
            caseNoteId: 0,
            createUserId: 'string',
            eventDate: 'string',
            eventId: 10,
            eventLocationId: 100,
            modifyUserId: 'string',
            paid: true,
            period: 'AM',
            prisonId: 'string',
          },
          {
            id: 2,
            absentReason: 'UnacceptableAbsence',
            attended: true,
            bookingId: 3,
            caseNoteId: 0,
            comments: 'Never turned up.',
            createUserId: 'string',
            eventDate: 'string',
            eventId: 20,
            eventLocationId: 200,
            modifyUserId: 'string',
            paid: false,
            period: 'AM',
            prisonId: 'string',
          },
        ],
      },
    })
    cy.task('stubGetEventsByLocationIds', {
      agencyId: caseload,
      date,
      timeSlot: 'AM',
      response: [
        {
          offenderNo: 'A1234AA',
          bookingId: 1,
          firstName: 'ARTHUR',
          lastName: 'ANDERSON',
          cellLocation: 'MDI-A-1-1',
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
          cellLocation: 'MDI-A-1-1',
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
          cellLocation: 'MDI-A-1-1',
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
          cellLocation: 'MDI-A-1-2',
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
          cellLocation: 'MDI-A-1-3',
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
          cellLocation: 'MDI-A-1-12',
          event: 'HC',
          eventType: 'APP',
          eventDescription: 'hair cut',
          eventLocation: 'room 1',
          comment: 'crew cut',
          startTime: '2017-10-15T19:10:00',
          endTime: '2017-10-15T20:30:00',
        },
      ],
    })
    cy.task('stubPostAttendance')
    cy.task('stubSentenceData')
    cy.task('stubCourtEvents')
    cy.task('stubExternalTransfers')
    cy.task('stubAlerts', { locationId: 'MDI', alerts: [] })
    cy.task('stubAssessments', ['A1234AA', 'A1234AB', 'A1234AC'])

    cy.task('stubGetAbsenceReasons')
  })

  it('Displays the houseblock list', () => {
    cy.visit(`/manage-prisoner-whereabouts`)
    const sPage = searchPage.verifyOnPage()

    sPage.period().select('AM')
    sPage.location().select('1')
    sPage.continueActivityButton().click()

    const houseblockPage = HouseblockPage.verifyOnPage('1')
    houseblockPage.tableRows().should('have.length', 4)
    houseblockPage.printButton().should('have.length', 2)
    houseblockPage.searchDate().should('have.value', 'Today')
    houseblockPage.location().contains('All')
    houseblockPage.locationOrderLink().contains('Location')

    houseblockPage
      .tableRows()
      .find('td:not(no-display):not(.no-print)')
      .then($cells => {
        expect($cells.get(0)).to.contain('Anderson, Arthur')
        expect($cells.get(1)).to.contain('A-1-1')
        expect($cells.get(2)).to.contain('A1234AA')
        expect($cells.get(3)).to.contain('CAT A')
        expect($cells.get(4)).to.contain('17:00 - Woodwork')
        expect($cells.get(5)).to.contain('18:00 - Visits - Friends')
        expect($cells.get(5)).to.contain('(cancelled)')
        expect($cells.get(5)).to.contain('19:10 - 20:30 - hair cut - room 1 - crew cut')

        expect($cells.get(8)).to.contain('Baa, Fred')
        expect($cells.get(9)).to.contain('A-1-3')
        expect($cells.get(10)).to.contain('A1234AC')
        expect($cells.get(11)).to.contain('CAT A Prov')
        expect($cells.get(12)).to.contain('11:45 - Chapel')

        expect($cells.get(17)).to.contain('Balog, Eugene')
        expect($cells.get(18)).to.contain('A-1-2')
        expect($cells.get(19)).to.contain('A1234AB')
        expect($cells.get(20)).to.contain('CAT A High')
        expect($cells.get(21)).to.contain('17:45 - TV Repairs')
      })

    houseblockPage
      .tableRows()
      .find('td.no-print')
      .then($cells => {
        expect($cells.get(2)).to.contain('Received')
      })

    cy.task('stubGetAbsenceReasons')
    cy.get('[data-qa="other-message"').contains('Unacceptable - Incentive Level warning')
    cy.get('[data-qa="other-message"')
      .parent()
      .click()
    cy.get('[name="absentReason"]').contains('Unacceptable - Incentive Level warning')
    cy.get('[name="comments"]').contains('Never turned up')
  })

  it('Displays multiple activities correctly', () => {
    cy.visit(`/manage-prisoner-whereabouts`)
    cy.task('stubAssessments', ['A1234AA'])
    cy.task('stubGetEventsByLocationIds', {
      agencyId: caseload,
      date,
      timeSlot: 'AM',
      response: [
        {
          offenderNo: 'A1234AA',
          bookingId: 1,
          firstName: 'ARTHUR',
          lastName: 'ANDERSON',
          cellLocation: 'MDI-A-1-1',
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
          bookingId: 5,
          firstName: 'ARTHUR',
          lastName: 'ANDERSON',
          cellLocation: 'LEI-A-1-1',
          event: 'PA',
          eventType: 'PRISON_ACT',
          eventDescription: 'reading',
          comment: 'conflict activity',
          startTime: '2017-10-15T16:50:00',
          endTime: '2017-10-15T18:30:00',
        },
      ],
    })
    const sPage = searchPage.verifyOnPage()

    sPage.period().select('AM')
    sPage.location().select('1')
    sPage.continueActivityButton().click()

    const houseblockPage = HouseblockPage.verifyOnPage('1')
    houseblockPage.tableRows().should('have.length', 2)
    houseblockPage.printButton().should('have.length', 2)
    houseblockPage.searchDate().should('have.value', 'Today')
    houseblockPage.location().contains('All')
    houseblockPage.locationOrderLink().contains('Location')

    houseblockPage
      .tableRows()
      .find('td:not(no-display):not(.no-print)')
      .then($cells => {
        expect($cells.get(0)).to.contain('Anderson, Arthur')
        expect($cells.get(1)).to.contain('A-1-1')
        expect($cells.get(2)).to.contain('A1234AA')
        expect($cells.get(3)).to.contain('CAT A')
        expect($cells.get(4)).to.contain('17:00 - Woodwork')
        expect($cells.get(5)).to.contain('16:50 - 18:30 - conflict activity')
      })
  })

  it('Displays 0 activities, transfers and releases', () => {
    cy.visit(`/manage-prisoner-whereabouts`)
    cy.task('stubAssessments', ['A1234AH', 'A1234AA', 'A1234AB', 'A1234AC'])
    cy.task('stubSentenceData', [
      {
        offenderNo: 'A1234AH',
        firstName: 'firstName',
        lastName: 'lastName',
        sentenceDetail: { releaseDate: date },
      },
    ])
    cy.task('stubCourtEvents', [
      {
        event: '19',
        eventDescription: 'Court Appearance - Police Product Order',
        eventId: 349360018,
        eventStatus: 'SCH',
        eventType: 'COURT',
        firstName: 'EAMONN',
        lastName: 'ANDREWS',
        offenderNo: 'A1234AA',
        startTime: '2018-09-05T15:00:00',
      },
      {
        event: '19',
        eventDescription: 'Court Appearance - Police Product Order',
        eventId: 349360018,
        eventStatus: 'COMP',
        eventType: 'COURT',
        firstName: 'EAMONN',
        lastName: 'ANDREWS',
        offenderNo: 'A1234AA',
        startTime: '2018-09-05T15:00:00',
      },
      {
        event: '19',
        eventDescription: 'Court Appearance - Police Product Order',
        eventId: 349360018,
        eventStatus: 'EXP',
        eventType: 'COURT',
        firstName: 'EAMONN',
        lastName: 'ANDREWS',
        offenderNo: 'A1234AA',
        startTime: '2018-09-05T15:00:00',
      },
    ])
    cy.task('stubExternalTransfers', [
      {
        eventDescription: 'Transfer to high security prison',
        eventStatus: 'SCH',
        eventType: 'COURT',
        firstName: 'EAMONN',
        lastName: 'ANDREWS',
        offenderNo: 'A1234AA',
        startTime: new Date(),
      },
      {
        eventDescription: 'Transfer to high security prison',
        eventStatus: 'COMP',
        eventType: 'COURT',
        firstName: 'EAMONN',
        lastName: 'ANDREWS',
        offenderNo: 'A1234AA',
        startTime: new Date(),
      },
      {
        eventDescription: 'Transfer to high security prison',
        eventStatus: 'CANC',
        eventType: 'COURT',
        firstName: 'EAMONN',
        lastName: 'ANDREWS',
        offenderNo: 'A1234AA',
        startTime: new Date(),
      },
      {
        eventDescription: 'Transfer to high security prison',
        eventStatus: 'EXP',
        eventType: 'COURT',
        firstName: 'EAMONN',
        lastName: 'ANDREWS',
        offenderNo: 'A1234AA',
        startTime: new Date(),
      },
    ])
    cy.task('stubGetEventsByLocationIds', {
      agencyId: caseload,
      date,
      timeSlot: 'AM',
      response: [
        {
          offenderNo: 'A1234AH',
          bookingId: 6,
          firstName: 'JOHN',
          lastName: 'JAMES',
          cellLocation: 'MDI-A-1-12',
          event: 'D',
          eventType: 'APP',
          eventDescription: 'docs',
          comment: 'non paid act 1',
          startTime: '2017-10-15T17:10:00',
          endTime: '2017-10-15T18:30:00',
        },
        {
          offenderNo: 'A1234AH',
          bookingId: 7,
          firstName: 'JOHN',
          lastName: 'JAMES',
          cellLocation: 'MDI-A-1-12',
          event: 'HC',
          eventType: 'APP',
          eventDescription: 'hair cut',
          comment: 'non paid act 2',
          startTime: '2017-10-15T19:10:00',
          endTime: '2017-10-15T20:30:00',
        },
        {
          offenderNo: 'A1234AA',
          bookingId: 1,
          firstName: 'ARTHUR',
          lastName: 'ANDERSON',
          cellLocation: 'MDI-A-1-1',
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
          cellLocation: 'MDI-A-1-1',
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
          cellLocation: 'MDI-A-1-2',
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
          cellLocation: 'MDI-A-1-3',
          event: 'PA',
          eventDescription: 'Prison Activities',
          eventType: 'PRISON_ACT',
          eventId: 40,
          eventLocationId: 400,
          comment: 'Chapel',
          startTime: '2017-10-15T11:45:00',
          endTime: '2017-10-15T13:30:00',
        },
      ],
    })
    const sPage = searchPage.verifyOnPage()

    sPage.period().select('AM')
    sPage.location().select('1')
    sPage.continueActivityButton().click()

    const houseblockPage = HouseblockPage.verifyOnPage('1')
    houseblockPage.tableRows().should('have.length', 5)
    houseblockPage.printButton().should('have.length', 2)
    houseblockPage.searchDate().should('have.value', 'Today')
    houseblockPage.location().contains('All')
    houseblockPage.locationOrderLink().contains('Location')

    houseblockPage
      .tableRows()
      .find('td:not(no-display):not(.no-print)')
      .then($cells => {
        expect($cells.get(0)).to.contain('Anderson, Arthur')
        expect($cells.get(1)).to.contain('A-1-1')
        expect($cells.get(2)).to.contain('A1234AA')
        expect($cells.get(3)).to.contain('CAT A')
        expect($cells.get(4)).to.contain('17:00 - Woodwork')
        expect($cells.get(5)).to.contain('Transfer scheduled')
        expect($cells.get(5)).to.contain('Court visit scheduled')

        expect($cells.get(26)).to.contain('James, John')
        expect($cells.get(27)).to.contain('A-1-12')
        expect($cells.get(28)).to.contain('A1234AH')
        expect($cells.get(29)).to.be.empty
        expect($cells.get(30)).to.be.empty
        expect($cells.get(31)).to.contain('Release scheduled')
      })
  })

  it('Should navigate to whereabouts home page on react', () => {
    cy.visit(`/manage-prisoner-whereabouts`)
    const sPage = searchPage.verifyOnPage()

    sPage.period().select('AM')
    sPage.location().select('1')
    sPage.continueActivityButton().click()

    HouseblockPage.verifyOnPage('1')
    cy.reload()
    searchPage.verifyOnPage()
  })

  it('Marks attendance', () => {
    cy.task('stubPostAttendance', {
      id: 1,
      bookingId: 101,
      eventId: 100,
      eventLocationId: 1,
    })
    cy.visit(`/manage-prisoner-whereabouts`)
    const sPage = searchPage.verifyOnPage()

    sPage.period().select('AM')
    sPage.location().select('1')
    sPage.continueActivityButton().click()

    const houseblockPage = HouseblockPage.verifyOnPage('1')
    houseblockPage.tableRows().should('have.length', 4)
    houseblockPage.printButton().should('have.length', 2)
    houseblockPage.searchDate().should('have.value', 'Today')
    houseblockPage.location().contains('All')
    houseblockPage.locationOrderLink().contains('Location')

    houseblockPage
      .tableRows()
      .find('td:not(no-display):not(.no-print)')
      .then($cells => {
        expect($cells.get(0)).to.contain('Anderson, Arthur')
        expect($cells.get(1)).to.contain('A-1-1')
        expect($cells.get(2)).to.contain('A1234AA')
        expect($cells.get(3)).to.contain('CAT A')
        expect($cells.get(4)).to.contain('17:00 - Woodwork')
        expect($cells.get(5)).to.contain('18:00 - Visits - Friends')
        expect($cells.get(5)).to.contain('(cancelled)')
        expect($cells.get(5)).to.contain('19:10 - 20:30 - hair cut - room 1 - crew cut')

        expect($cells.get(8)).to.contain('Baa, Fred')
        expect($cells.get(9)).to.contain('A-1-3')
        expect($cells.get(10)).to.contain('A1234AC')
        expect($cells.get(11)).to.contain('CAT A Prov')
        expect($cells.get(12)).to.contain('11:45 - Chapel')

        expect($cells.get(17)).to.contain('Balog, Eugene')
        expect($cells.get(18)).to.contain('A-1-2')
        expect($cells.get(19)).to.contain('A1234AB')
        expect($cells.get(20)).to.contain('CAT A High')
        expect($cells.get(21)).to.contain('17:45 - TV Repairs')
      })

    houseblockPage
      .tableRows()
      .find('td.no-print')
      .then($cells => {
        expect($cells.get(2)).to.contain('Received')
      })
    cy.get('[name="A1234AC40"').click()
    cy.get('[value="no"]').click()
    cy.get('[name="absentReason"').select('Refused')
    cy.get('[name="comments"').type('Never turned up')
    cy.get('button[name="confirm"]').click()

    houseblockPage.incentiveLevelCreated().should('be.visible')
  })
})
