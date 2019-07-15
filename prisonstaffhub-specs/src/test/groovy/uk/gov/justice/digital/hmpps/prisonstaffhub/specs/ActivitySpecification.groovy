package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.module.FormElement
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
        flags[0]*.text() == ['ACCT','E\u2011LIST','CAT A']
        flags[1]*.text() == ['CAT A Prov']
        flags[2]*.text() == ['CAT A High']
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

        when: "I change selections and update"
        def firstOfMonthDisplayFormat = '01/08/2018'
        def firstOfMonthApiFormat = '2018-08-01'
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 1, 'PM', firstOfMonthApiFormat)
        whereaboutsApi.stubGetAttendance(ITAG_USER.workingCaseload, 1, 'PM', firstOfMonthApiFormat)
        whereaboutsApi.stubGetAbsenceReasons()
        setDatePicker('2018', 'Aug', '1')
        updateButton.click()

        then: 'The new activity list results are displayed'
        at ActivityPage
        form['search-date'] == firstOfMonthDisplayFormat
        form['period-select'] == 'PM'

        events == [
                '17:00 - Activity 1',
                '11:45 - Activity 1',
                '17:45 - Activity 1',
                '17:00 - Activity 2',
                '17:00 - Activity 3'
        ]


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

    private static String getNow() {
        String pattern = "YYYY-MM-dd"
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern)
        simpleDateFormat.format(new Date())
    }
}
