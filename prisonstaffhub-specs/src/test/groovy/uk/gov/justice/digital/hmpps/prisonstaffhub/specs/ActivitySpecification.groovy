package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.module.FormElement
import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ActivityPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class ActivitySpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    TestFixture fixture = new TestFixture(browser, elite2api)
    def initialPeriod;

    def "The activity list is displayed"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 2, 'AM', today)
        form['period-select'] = 'AM'
        waitFor { !activity.module(FormElement).disabled }
        form['activity-select'] = 'loc2'

        continueButton.click()

        then: 'The activity list is displayed'
        at ActivityPage
        activityTitle == 'loc2'
        printButton[0].displayed
        printButton[1].displayed

        def texts = tableRows*.text()
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA")
        texts[1].contains("Visits - Friends 18:00")
        texts[1].contains("Medical - Dentist - Appt details 11:40")
        texts[3].contains("Balog, Eugene A-1-2 A1234AB")
        texts[2].contains("Baa, Fred A-1-3 A1234AC")
    }

    def "The updated activity list is displayed"() {
        given: 'I am on the activity list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetActivityList(ITAG_USER.workingCaseload, 1, 'PM', today)
        form['period-select'] = 'PM'
        waitFor { !activity.module(FormElement).disabled }
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
        def texts = tableRows*.text()
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA")
        texts[3].contains("Balog, Eugene A-1-2 A1234AB")

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
        waitFor { !activity.module(FormElement).disabled }
        form['activity-select'] = 'loc1'

        continueButton.click()
        at ActivityPage

        when: "I refresh the page"
        driver.navigate().refresh();

        then: "I should be redirected to the search page"
        at SearchPage
    }
}
