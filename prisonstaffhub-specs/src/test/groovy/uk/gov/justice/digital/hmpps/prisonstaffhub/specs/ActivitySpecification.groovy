package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.module.FormElement
import groovy.json.JsonOutput
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ActivityPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import java.text.SimpleDateFormat
import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class ActivitySpecification extends BrowserReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)
    def initialPeriod

    def offenders = [
            Map.of("bookingId", 1, "offenderNo", "A1234AA" ),
            Map.of("bookingId", 2, "offenderNo", "A1234AC" ),
            Map.of("bookingId", 3, "offenderNo", "A1234AB" ),
            Map.of("bookingId", 4, "offenderNo", "A1234AA" ),
            Map.of("bookingId", 5, "offenderNo", "A1234AA" )
    ]

    def "The activity list is displayed"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = getNow()

        offenders.collect{ offender -> elite2api.stubOffenderDetails(false, offender)}
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 2, 'AM', today)
        whereaboutsApi.stubGetAbsenceReasons()
        whereaboutsApi.stubGetAttendance(ITAG_USER.workingCaseload, 2, 'AM', today)

        form['period-select'] = 'AM'
        waitFor { activity.module(FormElement).enabled }
        form['activity-select'] = 'loc2'

        continueButton.click()

        then: 'The activity list is displayed'
        at ActivityPage
        activityTitle == 'loc2'
        printButton[0].displayed
        printButton[1].displayed

        tableRows.size() == 6

        locations == [
                'A-1-1',
                'A-1-3',
                'A-1-2',
                'A-1-1',
                'A-1-1'
        ]

        nomsIds == offenders.collect { offender -> offender.offenderNo }
        flags[0]*.text() == ['ACCT','E-LIST','CAT A']
        flags[1]*.text() == ['CAT A Prov']
        flags[2]*.text() == ['CAT A High']

        prisonersListed.text() == '3'
        sessionsAttended.text() == '0'

        events == [
                '17:00 - Activity 1',
                '11:45 - Activity 1',
                '17:45 - Activity 1',
                '17:00 - Activity 2',
                '17:00 - Activity 3'
        ]

        eventsElsewhere == [
                [
                        'Court visit scheduled',
                        'Court visit scheduled (expired)',
                        'Court visit scheduled (complete)',
                        'Transfer scheduled',
                        'Transfer scheduled (complete)',
                        'Transfer scheduled (cancelled)',
                        'Transfer scheduled (expired)',
                        '15:30 - Medical - Dentist - Medical Room1 - Appt details',
                        '18:00 - Visits - Friends'],
                [
                        'Release scheduled'],
                [],
                [
                        'Court visit scheduled',
                        'Court visit scheduled (expired)',
                        'Court visit scheduled (complete)',
                        'Transfer scheduled',
                        'Transfer scheduled (complete)',
                        'Transfer scheduled (cancelled)',
                        'Transfer scheduled (expired)',
                        '15:30 - Medical - Dentist - Medical Room1 - Appt details',
                        '18:00 - Visits - Friends'
                ],
                [
                        'Court visit scheduled',
                        'Court visit scheduled (expired)',
                        'Court visit scheduled (complete)',
                        'Transfer scheduled',
                        'Transfer scheduled (complete)',
                        'Transfer scheduled (cancelled)',
                        'Transfer scheduled (expired)',
                        '15:30 - Medical - Dentist - Medical Room1 - Appt details',
                        '18:00 - Visits - Friends']
        ]
    }

    def "The activity list handles sorting correctly"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = getNow()
        offenders.collect{ offender -> elite2api.stubOffenderDetails(false, offender) }
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 2, 'AM', today)
        whereaboutsApi.stubGetAbsenceReasons()
        whereaboutsApi.stubGetAttendance(ITAG_USER.workingCaseload, 2, 'AM', today)
        form['period-select'] = 'AM'
        waitFor { activity.module(FormElement).enabled }
        form['activity-select'] = 'loc2'

        continueButton.click()

        then: 'The activity list is displayed'
        at ActivityPage

        tableRows.size() == 6

        nomsIds == [
                'A1234AA',
                'A1234AC',
                'A1234AB',
                'A1234AA',
                'A1234AA'
        ]

        when:
        sortSelect = 'lastName_ASC'

        then:
        tableRows.size() == 6

        nomsIds == [
                'A1234AA',
                'A1234AA',
                'A1234AA',
                'A1234AC',
                'A1234AB',
        ]

        when:
        sortSelect = 'lastName_DESC'

        then:
        tableRows.size() == 6

        nomsIds == [
                'A1234AB',
                'A1234AC',
                'A1234AA',
                'A1234AA',
                'A1234AA',

        ]

    }


    def "The updated activity list is displayed"() {
        given: 'I am on the activity list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = getNow()
        offenders.collect{ offender -> elite2api.stubOffenderDetails(false, offender) }
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 1, 'PM', today)
        whereaboutsApi.stubGetAttendance(ITAG_USER.workingCaseload, 1, 'PM', today)
        whereaboutsApi.stubGetAbsenceReasons()

        form['period-select'] = 'PM'
        waitFor { activity.module(FormElement).enabled }
        form['activity-select'] = 'loc1'
        continueButton.click()
        at ActivityPage
        activityTitle == 'loc1'

        events == [
                '17:00 - Activity 1',
                '11:45 - Activity 1',
                '17:45 - Activity 1',
                '17:00 - Activity 2',
                '17:00 - Activity 3'
        ]

        prisonersListed.text() == '3'
        sessionsAttended.text() == '0'

        when: "I change selections and update"
        def firstOfMonthDisplayFormat = '01/08/2018'
        def firstOfMonthApiFormat = '2018-08-01'
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 1, 'PM', firstOfMonthApiFormat, true)
        whereaboutsApi.stubGetAttendance(ITAG_USER.workingCaseload, 1, 'PM', firstOfMonthApiFormat)
        whereaboutsApi.stubGetAbsenceReasons()
        setDatePicker('2018', 'Aug', '1')

        then: 'The new activity list results are displayed'
        at ActivityPage
        form['search-date'] == firstOfMonthDisplayFormat
        form['period-select'] == 'PM'

        events == [
                '17:00 - Activity 1',
                '17:45 - Activity 1',
                '17:00 - Activity 2',
        ]

        prisonersListed.text() == '2'
        sessionsAttended.text() == '0'


        when: "I go to the search page afresh"
        browser.to SearchPage

        then: 'The selections are reinitialised'
        at SearchPage
        date.value() == 'Today'
        period.value() == this.initialPeriod
    }

    def "should navigate to the whereabouts search on a page refresh"() {
        given: 'I am on the activity list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = getNow()
        offenders.collect{ offender -> elite2api.stubOffenderDetails(false, offender) }
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 1, 'PM', today)
        whereaboutsApi.stubGetAttendance(ITAG_USER.workingCaseload, 1, 'PM', today)
        whereaboutsApi.stubGetAbsenceReasons()
        oauthApi.stubGetMyRoles()
        form['period-select'] = 'PM'
        waitFor { activity.module(FormElement).enabled }
        form['activity-select'] = 'loc1'
        continueButton.click()
        at ActivityPage

        when: "I refresh the page"
        driver.navigate().refresh()

        then: "I should be redirected to the search page"
        at SearchPage
    }

    def "should display absent reason link and show attended as checked"() {
        given: "I am on the activity list page"
        fixture.toSearch()

        String date = getNow()
        Caseload caseload = ITAG_USER.workingCaseload
        int locationId = 1
        String timeSlot = 'AM'

        def offenders = [
                [ offenderNo: 'A1234AA', bookingId: 1],
                [ offenderNo: 'A1234AC', bookingId: 2]
        ]

        def activities = [
                [
                        offenderNo: "A1234AA",
                        bookingId: 1,
                        event: "PA",
                        eventId: 100,
                        eventDescription: "Prison Activities",
                        locationId: 1,
                        eventLocationId: 1,
                        firstName: "ARTHUR",
                        lastName: "ANDERSON",
                        cellLocation: "LEI-A-1-1",
                        comment: "Activity 3",
                        startTime: "2017-10-15T17:00:00",
                        endTime: "2017-10-15T18:30:00",
                ],
                [
                        offenderNo: "A1234AC",
                        bookingId: 2,
                        event: "PA",
                        eventId: 101,
                        eventDescription: "Prison Activities",
                        locationId: 1,
                        eventLocationId: 1,
                        firstName: "JOHN",
                        lastName: "DOE",
                        cellLocation: "LEI-A-1-1",
                        comment: "Activity 3",
                        startTime: "2017-10-15T17:00:00",
                        endTime: "2017-10-15T18:30:00",
                ]
        ]

        def attendance = [
                attendances: [
                        [
                                id: 1,
                                bookingId: 2,
                                eventId: 101,
                                eventLocationId: 1,
                                period: 'AM',
                                prisonId: 'LEI',
                                attended: false,
                                paid: false,
                                absentReason: 'UnacceptableAbsence',
                                eventDate: '2019-05-15'
                        ],
                        [
                                id: 2,
                                bookingId: 1,
                                eventId: 100,
                                eventLocationId: 1,
                                period: 'AM',
                                prisonId: 'LEI',
                                attended: true,
                                paid: true,
                                eventDate: '2019-05-15'
                        ]
                ]
        ]

        whereaboutsApi.stubGetAttendance(ITAG_USER.workingCaseload, locationId, timeSlot, date, attendance)
        elite2api.stubProgEventsAtLocation(locationId, timeSlot, date, JsonOutput.toJson(activities))
        stubForAttendance(ITAG_USER.workingCaseload, locationId, timeSlot, date, offenders)

        when: "I select a period and activity location"
        form['period-select'] = 'AM'
        waitFor { activity.module(FormElement).enabled }
        form['activity-select'] = 'loc1'
        continueButton.click()
        at ActivityPage

        then: "The the absent reason should be visible"

        assert attendedValues == ['pay', null]
        assert absenseReasons == [null, 'Unacceptable - IEP']
    }


    def "create new non attendance with absent reason then update to attended"() {
        given: "I am on the activity list page"
        fixture.toSearch()

        String date = getNow()
        Caseload caseload = ITAG_USER.workingCaseload
        int locationId = 1
        String timeSlot = 'AM'

        def offenders = [
            [ offenderNo: 'A1234AA', bookingId: 1],
        ]

        def activities = [
            [
                offenderNo: "A1234AA",
                bookingId: 1,
                event: "PA",
                eventId: 100,
                eventDescription: "Prison Activities",
                locationId: 1,
                eventLocationId: 1,
                firstName: "ARTHUR",
                lastName: "ANDERSON",
                cellLocation: "LEI-A-1-1",
                comment: "Activity 3",
                startTime: "2017-10-15T17:00:00",
                endTime: "2017-10-15T18:30:00",
             ]
        ]
        def attendanceToReturn = [
                id: 1,
                bookingId: 1,
                eventId: 100,
                eventLocationId: 1,
        ]

        whereaboutsApi.stubGetAttendance(ITAG_USER.workingCaseload, locationId, timeSlot, date, [])
        elite2api.stubProgEventsAtLocation(locationId, timeSlot, date, JsonOutput.toJson(activities))
        whereaboutsApi.stubPostAttendance(attendanceToReturn)
        whereaboutsApi.stubPutAttendance(attendanceToReturn)

        stubForAttendance(ITAG_USER.workingCaseload, locationId, timeSlot, date, offenders)

        when: "I select a period and activity location"
        form['period-select'] = 'AM'
        waitFor { activity.module(FormElement).enabled }
        form['activity-select'] = 'loc1'
        continueButton.click()
        at ActivityPage

        then: "Clicking the not attend radio button should open the absent reason modal"
        notAttendedRadioElements.getAt(0).click()

        then: "Fill put the absent reason form as an acceptable absence"
        assert absentReasonForm.fillOutAbsentReasonForm()

        then: "Mark as attended"
        attendRadioElements.getAt(0).click()

        then: "An attendance record should of been created then updated"
        whereaboutsApi.verifyPostAttendance()
        whereaboutsApi.verifyPutAttendance(attendanceToReturn.id)
    }

    void stubForAttendance(caseload, locationId, timeSlot, date, offenders) {
        offenders.each{ it -> elite2api.stubOffenderDetails(false, it) }
        whereaboutsApi.stubGetAbsenceReasons()
        oauthApi.stubGetMyRoles()
        elite2api.stubVisitsAtLocation(caseload, locationId, timeSlot, date)
        elite2api.stubAppointmentsAtLocation(caseload, locationId, timeSlot, date)
        elite2api.stubAllOtherEventsOnActivityLists(caseload, timeSlot, date, offenders.collect{ it -> it.offenderNo})
    }

    private static String getNow() {
        String pattern = "YYYY-MM-dd"
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern)
        simpleDateFormat.format(new Date())
    }
}
