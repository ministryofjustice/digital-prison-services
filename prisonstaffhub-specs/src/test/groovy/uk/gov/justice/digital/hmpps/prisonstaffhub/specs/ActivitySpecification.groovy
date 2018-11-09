package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.module.FormElement
import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ActivityPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class ActivitySpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)
    def initialPeriod;

    def "The activity list is displayed"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 2, 'AM', today)
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

        nomsIds == [
                'A1234AA',
                'A1234AC',
                'A1234AB',
                'A1234AA',
                'A1234AA'
        ]
        flags[0]*.text() == ['ACCT','E-LIST','CAT A']
        flags[1]*.text() == ['CAT A Prov']
        flags[2]*.text() == ['CAT A H']
        events == [
                'Activity 1',
                'Activity 1',
                'Activity 1',
                'Activity 2',
                'Activity 3'
        ]

        eventsElsewhere == [
                [
                        '** Court visit scheduled **',
                        '** Court visit scheduled ** (expired)',
                        '** Court visit scheduled ** (complete)',
                        '** Transfer scheduled **',
                        '** Transfer scheduled ** (complete)',
                        '** Transfer scheduled ** (cancelled)',
                        '** Transfer scheduled ** (expired)',
                        'Medical - Dentist - Appt details 15:30',
                        'Visits - Friends 18:00'],
                [
                        '** Release scheduled **'],
                [],
                [
                        '** Court visit scheduled **',
                        '** Court visit scheduled ** (expired)',
                        '** Court visit scheduled ** (complete)',
                        '** Transfer scheduled **',
                        '** Transfer scheduled ** (complete)',
                        '** Transfer scheduled ** (cancelled)',
                        '** Transfer scheduled ** (expired)',
                        'Medical - Dentist - Appt details 15:30',
                        'Visits - Friends 18:00'
                ],
                [
                        '** Court visit scheduled **',
                        '** Court visit scheduled ** (expired)',
                        '** Court visit scheduled ** (complete)',
                        '** Transfer scheduled **',
                        '** Transfer scheduled ** (complete)',
                        '** Transfer scheduled ** (cancelled)',
                        '** Transfer scheduled ** (expired)',
                        'Medical - Dentist - Appt details 15:30',
                        'Visits - Friends 18:00']
        ]
    }

    def "The updated activity list is displayed"() {
        given: 'I am on the activity list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 1, 'PM', today)
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
        setDatePicker('2018', 'Aug', '1')
        updateButton.click()

        then: 'The new activity list results are displayed'
        at ActivityPage
        form['date'] == firstOfMonthDisplayFormat
        form['period-select'] == 'PM'

        events == [
                'Activity 1',
                'Activity 1',
                'Activity 1',
                'Activity 2',
                'Activity 3'
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
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 1, 'PM', today)
        form['period-select'] = 'PM'
        waitFor { activity.module(FormElement).enabled }
        form['activity-select'] = 'loc1'
        continueButton.click()
        at ActivityPage

        when: "I refresh the page"
        driver.navigate().refresh();

        then: "I should be redirected to the search page"
        at SearchPage
    }
}
