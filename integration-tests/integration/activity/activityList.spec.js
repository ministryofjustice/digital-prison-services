const activityPage = require('../../pages/whereabouts/activityPage')

const caseload = 'MDI'
const date = new Date().toISOString().split('T')[0]

context('Activity list page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubGroups', { id: caseload })
    cy.task('stubLogin', { username: 'ITAG_USER', caseload })
    cy.login()
    cy.task('stubActivityLocations')

    const offenders = [
      {
        bookingId: 1,
        offenderNo: 'A1234AA',
      },
      {
        bookingId: 2,
        offenderNo: 'A1234AC',
      },
      {
        bookingId: 3,
        offenderNo: 'A1234AB',
      },
      {
        bookingId: 4,
        offenderNo: 'A1234AA',
      },
      {
        bookingId: 5,
        offenderNo: 'A1234AA',
      },
    ]
    offenders.forEach((offender) => {
      cy.task('stubOffenderBasicDetails', offender)
    })
    cy.task('stubGetAbsenceReasons')
  })

  it.skip('Displays the activity list', () => {
    cy.visit('/manage-prisoner-whereabouts/select-location')
    cy.task('stubGetActivityList', { caseload, locationId: 2, timeSlot: 'AM', date })
    cy.task('stubGetAttendance', { caseload, locationId: 2, timeSlot: 'AM', date })

    cy.get('#period').select('AM')
    cy.get('#current-location').select('loc2')
    cy.get('[type="submit"]').click()

    const aPage = activityPage.verifyOnPage('loc2')

    cy.get('.printButton').should('have.length', 2)

    aPage.getActivityTotals().should(($activityTotals) => {
      expect($activityTotals).to.have.length(2)
      expect($activityTotals.first()).to.contain('3')
      expect($activityTotals[1]).to.contain('0')
    })

    aPage.getAllResultRows().find('tr').should('have.length', 6)

    const resultRows = aPage.getResultBodyRows()
    resultRows.should('have.length', 5)
    const activities = [
      '17:00 - Activity 1',
      '11:45 - Activity 1',
      '17:45 - Activity 1',
      '17:00 - Activity 2',
      '17:00 - Activity 3',
    ]
    aPage.getResultActivity().each(($el, index) => {
      expect($el.text()).to.equal(activities[index])
    })

    const locations = ['A-1-1', 'A-1-3', 'A-1-2', 'A-1-1', 'A-1-1']
    aPage.getResultLocations().each(($el, index) => {
      expect($el.text()).to.equal(locations[index])
    })

    const arthurAlerts = 'ACCT E-LIST CAT A '
    const alerts = [arthurAlerts, 'CAT A Prov ', 'CAT A High ', arthurAlerts, arthurAlerts]
    aPage.getResultAlerts().each(($el, index) => {
      expect($el.text()).to.equal(alerts[index])
    })

    const arthurEvents = [
      'Court visit scheduled',
      'Court visit scheduled (expired)',
      'Court visit scheduled (complete)',
      'Transfer scheduled',
      'Transfer scheduled (complete)',
      'Transfer scheduled (cancelled)',
      'Transfer scheduled (expired)',
      '15:30 - Medical - Dentist - Medical Room1 - Appt details',
      '18:00 - Visits - Friends',
    ]
    const eventsElsewhere = [arthurEvents, ['Release scheduled'], [], arthurEvents, arthurEvents]
    aPage.getResultEventsElsewhere().each(($el, index) => {
      expect($el.text()).to.equal(eventsElsewhere[index].join(''))
    })
  })

  it('The activity list handles sorting correctly', () => {
    cy.task('stubGetActivityList', { caseload, locationId: 2, timeSlot: 'AM', date })
    cy.task('stubGetAttendance', { caseload, locationId: 2, timeSlot: 'AM', date })
    cy.visit('/manage-prisoner-whereabouts/select-location')

    cy.get('#period').select('AM')
    cy.get('#current-location').select('loc2')
    cy.get('[type="submit"]').click()

    const aPage = activityPage.verifyOnPage('loc2')
    aPage.getAllResultRows().find('tr').should('have.length', 6)

    const nomsIds = ['A1234AA', 'A1234AC', 'A1234AB', 'A1234AA', 'A1234AA']

    aPage.getResultNomsIds().each(($el, index) => {
      expect($el.text()).to.equal(nomsIds[index])
    })

    aPage.sortSelect().select('lastName_ASC')
    aPage.getAllResultRows().find('tr').should('have.length', 6)
    const nomsIdsLastNameASC = ['A1234AA', 'A1234AA', 'A1234AA', 'A1234AC', 'A1234AB']
    aPage.getResultNomsIds().each(($el, index) => {
      expect($el.text()).to.equal(nomsIdsLastNameASC[index])
    })

    aPage.sortSelect().select('lastName_DESC')
    aPage.getAllResultRows().find('tr').should('have.length', 6)
    const nomsIdsLastNameDESC = ['A1234AB', 'A1234AC', 'A1234AA', 'A1234AA', 'A1234AA']
    aPage.getResultNomsIds().each(($el, index) => {
      expect($el.text()).to.equal(nomsIdsLastNameDESC[index])
    })
  })

  it.skip('Displays the updated activity list', () => {
    cy.task('stubGetActivityList', { caseload, locationId: 1, timeSlot: 'PM', date })
    cy.task('stubGetAttendance', { caseload, locationId: 1, timeSlot: 'PM', date })
    cy.visit('/manage-prisoner-whereabouts/select-location')

    cy.get('#period').select('PM')
    cy.get('#current-location').select('loc1')
    cy.get('[type="submit"]').click()

    const aPage = activityPage.verifyOnPage('loc1')
    aPage.getAllResultRows().find('tr').should('have.length', 6)

    const activities = [
      '11:45 - Activity 1',
      '17:45 - Activity 1',
      '17:00 - Activity 2',
      '17:00 - Activity 3',
      '15:30 - Medical - Dentist - Appt details',
    ]
    aPage.getResultActivity().each(($el, index) => {
      expect($el.text()).to.equal(activities[index])
    })

    aPage.getActivityTotals().should(($activityTotals) => {
      expect($activityTotals).to.have.length(2)
      expect($activityTotals.first()).to.contain('3')
      expect($activityTotals[1]).to.contain('0')
    })

    // when: I change selections and update
    const d = new Date()
    const lastYear = d.getFullYear() - 1
    const firstOfMonthApiFormat = `${lastYear}-08-01`
    cy.task('stubGetActivityList', {
      caseload,
      locationId: 1,
      timeSlot: 'PM',
      date: firstOfMonthApiFormat,
      inThePast: true,
    })
    cy.task('stubGetAttendance', { caseload, locationId: 1, timeSlot: 'PM', date: firstOfMonthApiFormat })

    aPage.datePicker().click()
    aPage.datePickerTopBar().click()
    aPage.datePickerTopBar().click()
    aPage.getPickerYearSelector(lastYear).click()
    aPage.getPickerMonthSelector('Aug').click()
    aPage.getPickerDaySelector('1').click()

    aPage.getActivityTotals().should(($activityTotals) => {
      expect($activityTotals).to.have.length(2)
      expect($activityTotals.first()).to.contain('2')
      expect($activityTotals[1]).to.contain('0')
    })

    const newActivities = ['17:45 - Activity 1', '17:00 - Activity 2', '15:30 - Medical - Dentist - Appt details']
    aPage.getResultActivity().each(($el, index) => {
      expect($el.text()).to.equal(newActivities[index])
    })
  })

  it('displays absent reason link and shows attended as checked', () => {
    const timeSlot = 'AM'
    const locationId = 1

    const offenders = [
      {
        offenderNo: 'A1234AA',
        bookingId: 101,
      },
      {
        offenderNo: 'A1234AC',
        bookingId: 201,
      },
    ]

    const activities = [
      {
        offenderNo: 'A1234AA',
        bookingId: 101,
        event: 'PA',
        eventId: 100,
        eventDescription: 'Prison Activities',
        locationId: 1,
        eventLocationId: 1,
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: 'LEI-A-1-1',
        comment: 'Activity 3',
        startTime: '2017-10-15T17:00:00',
        endTime: '2017-10-15T18:30:00',
      },
      {
        offenderNo: 'A1234AC',
        bookingId: 201,
        event: 'PA',
        eventId: 101,
        eventDescription: 'Prison Activities',
        locationId: 1,
        eventLocationId: 1,
        firstName: 'JOHN',
        lastName: 'DOE',
        cellLocation: 'LEI-A-1-1',
        comment: 'Activity 3',
        startTime: '2017-10-15T17:00:00',
        endTime: '2017-10-15T18:30:00',
      },
    ]

    const attendance = {
      attendances: [
        {
          id: 1,
          bookingId: 201,
          eventId: 101,
          eventLocationId: 1,
          period: 'AM',
          prisonId: 'LEI',
          attended: false,
          paid: false,
          absentReason: 'UnacceptableAbsence',
          eventDate: '2019-05-15',
        },
        {
          id: 2,
          bookingId: 101,
          eventId: 100,
          eventLocationId: 1,
          period: 'AM',
          prisonId: 'LEI',
          attended: true,
          paid: true,
          eventDate: '2019-05-15',
        },
      ],
    }

    offenders.forEach((offender) => {
      cy.task('stubOffenderBasicDetails', offender)
    })

    // given: I am on the activity list page
    cy.task('stubForAttendance', { caseload, locationId, timeSlot, date, activities })
    cy.task('stubGetAttendance', { caseload, locationId, timeSlot, date, data: attendance })
    cy.visit('/manage-prisoner-whereabouts/select-location')

    // when: "I select a period and activity location"
    cy.get('#period').select('AM')
    cy.get('#current-location').select('loc1')
    cy.get('[type="submit"]').click()

    const aPage = activityPage.verifyOnPage('loc1')

    // then: "The the absent reason should be visible"
    aPage.getAttendedValues().then(($inputs) => {
      cy.get($inputs.get(0)).should('be.checked')
      cy.get($inputs.get(0)).should('have.value', 'pay')
      cy.get($inputs.get(1)).should('not.be.checked')
      cy.get($inputs.get(1)).should('have.value', 'pay')
    })

    aPage.getAbsenceReasons().then(($inputs) => {
      expect($inputs.get(0).innerText).to.eq('Other')
      expect($inputs.get(1).innerText).to.eq('Unacceptable - Incentive Level warning')
    })
  })

  it('creates new non attendance with absent reason then updates to attended', () => {
    const timeSlot = 'AM'
    const locationId = 1

    const offenders = [
      {
        offenderNo: 'A1234AA',
        bookingId: 101,
      },
    ]

    const activities = [
      {
        offenderNo: 'A1234AA',
        bookingId: 101,
        event: 'PA',
        eventId: 100,
        eventDescription: 'Prison Activities',
        locationId: 1,
        eventLocationId: 1,
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: 'MDI-A-1-1',
        comment: 'Activity 3',
        startTime: '2017-10-15T17:00:00',
        endTime: '2017-10-15T18:30:00',
      },
    ]

    const attendanceToReturn = {
      id: 1,
      bookingId: 101,
      eventId: 100,
      eventLocationId: 1,
    }

    offenders.forEach((offender) => {
      cy.task('stubOffenderBasicDetails', offender)
    })

    // given: I am on the activity list page
    cy.task('stubForAttendance', { caseload, locationId, timeSlot, date, activities })
    cy.task('stubGetAttendance', { caseload, locationId, timeSlot, date, data: [] })
    cy.task('stubPostAttendance', attendanceToReturn)
    cy.task('stubPutAttendance', attendanceToReturn)

    cy.visit('/manage-prisoner-whereabouts/select-location')

    // when: "I select a period and activity location"
    cy.get('#period').select('AM')
    cy.get('#current-location').select('loc1')
    cy.get('[type="submit"]').click()

    const aPage = activityPage.verifyOnPage('loc1')

    // then: "The the absent reason should be visible"
    aPage.getAttendedValues().then(($inputs) => {
      cy.get($inputs.get(0)).should('not.be.checked')
      cy.get($inputs.get(0)).should('have.value', 'pay')
    })

    aPage.getAbsenceReasons().then(($inputs) => {
      cy.get($inputs.get(0)).should('not.be.checked')
      expect($inputs.get(0).innerText).to.eq('Other')
    })

    // then: "Clicking the not attended radio button should open the absent reason modal"
    aPage.getAbsenceReasonsInput().first().check()

    // then: "Fill out the absent reason form as an acceptable absence"
    aPage.fillOutAbsentReason()

    // then: "Mark as attended"
    aPage.getAttendedValues().then(($inputs) => {
      cy.get($inputs.get(0)).click()
    })

    // then: "An attendance record should have been created and updated"
    cy.task('verifyPostAttendance').then((val) => {
      expect(JSON.parse(val.text).count).to.equal(1)
    })
  })

  it('should display the feedback banner with the correct href', () => {
    cy.visit('/manage-prisoner-whereabouts/select-location')
    cy.task('stubGetActivityList', { caseload, locationId: 2, timeSlot: 'AM', date })
    cy.task('stubGetAttendance', { caseload, locationId: 2, timeSlot: 'AM', date })

    cy.get('#period').select('AM')
    cy.get('#current-location').select('loc2')
    cy.get('[type="submit"]').click()

    const page = activityPage.verifyOnPage('loc2')

    page
      .feedbackBanner()
      .find('a')
      .should('contain', 'Give feedback on this service')
      .should('have.attr', 'href')
      .then((href) => {
        expect(href).to.equal(
          'https://eu.surveymonkey.com/r/GYB8Y9Q?source=localhost/manage-prisoner-whereabouts/activity-results'
        )
      })
  })

  context('Missing query string parameters', () => {
    const verifyOnSelectLocationPage = () => cy.get('h1').contains('View by activity or appointment location')

    beforeEach(() => {
      cy.task('stubGetActivityList', { caseload, locationId: 2, timeSlot: 'AM', date })
      cy.task('stubGetAttendance', { caseload, locationId: 2, timeSlot: 'AM', date })
    })
    context('redirects to /select-location', () => {
      it('when all query string parameters are missing', () => {
        cy.visit('/manage-prisoner-whereabouts/activity-results')

        verifyOnSelectLocationPage()
      })

      it('when all but the date is missing', () => {
        cy.visit('/manage-prisoner-whereabouts/activity-results?date=02/08/2021')

        verifyOnSelectLocationPage()
      })

      it('when all but the locationId is missing', () => {
        cy.visit('/manage-prisoner-whereabouts/activity-results?date=02/08/2021&period=AM')

        verifyOnSelectLocationPage()
      })

      it('when all but the period is missing', () => {
        cy.visit('/manage-prisoner-whereabouts/activity-results?location=27219&date=02/08/2021&')

        verifyOnSelectLocationPage()
      })
    })
  })
})
