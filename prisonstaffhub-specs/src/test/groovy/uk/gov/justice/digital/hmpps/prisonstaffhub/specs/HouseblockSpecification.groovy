package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.HouseblockPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class HouseblockSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    TestFixture fixture = new TestFixture(browser, elite2api)
    def initialPeriod;

    def "The houseblock list is displayed and reordered"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'BWing', 'AM', today)
        form['housing-location-select'] = 'BWing'
      //  form['date'] = ??? TODO cannot set input, have to click calendar!
//        datePicker.click()
//        days[0].click() // select 1st of this month for now

        form['period-select'] = 'AM'
        continueButton.click()

        then: 'The houseblock list is displayed'
        at HouseblockPage
        printButton[0].displayed
        printButton[1].displayed
        nameOrderLink.text() == 'Name'
        // Check order is by cell
        def texts = tableRows*.text()
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA Woodwork")
        texts[2].contains("Balog, Eugene A-1-2 A1234AB TV Repairs")
        texts[3].contains("Baa, Fred A-1-3 A1234AC Chapel")

        when: "I order by name"
        nameOrderLink.click()

        then: 'The houseblock list is displayed in the new order'
        at HouseblockPage
        form['housing-location-select'] == 'BWing'
        form['date'] == 'Today'
        form['period-select'] == 'AM'

        def texts2 = tableRows*.text()
        // Check order is by name
        texts2[1].contains("Anderson, Arthur A-1-1 A1234AA Woodwork")
        texts2[1].contains("Visits - Friends 18:00")
        texts2[2].contains("Baa, Fred A-1-3 A1234AC Chapel")
        texts2[3].contains("Balog, Eugene A-1-2 A1234AB TV Repairs")
    }

    def "The updated houseblock list is displayed"() {
        given: 'I am on the houseblock list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'AWing', 'PM', today)
        form['period-select'] = 'PM'
        continueButton.click()
        at HouseblockPage
        form['housing-location-select'] == 'AWing'

        when: "I change selections and update"
        def firstOfMonthDisplayFormat = '01/'+ new Date().format('MM/yyyy')
        def firstOfMonthApiFormat = new Date().format('yyyy-MM') + '-01'
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'BWing', 'PM', firstOfMonthApiFormat)
        form['housing-location-select'] = 'BWing'
        date.click() // get calendar
        firstDay.click() // select 1st of this month
        updateButton.click()

        then: 'The new houseblock list results are displayed'
        at HouseblockPage
        form['housing-location-select'] == 'BWing'
        form['date'] == firstOfMonthDisplayFormat
        form['period-select'] == 'PM'
        def texts = tableRows*.text()
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA Woodwork")
        texts[2].contains("Balog, Eugene A-1-2 A1234AB TV Repairs")

        when: "I go to the search page afresh"
        browser.to SearchPage

        then: 'The selections are reinitialised'
        at SearchPage
        location.value() == 'AWing'
        date.value() == 'Today'
        period.value() == this.initialPeriod
    }

    def "should navigate to the whereabouts search on a page refresh"() {
        given: 'I am on the houseblock list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'AWing', 'PM', today)
        form['period-select'] = 'PM'
        continueButton.click()
        at HouseblockPage

        when: "I refresh the page"
        driver.navigate().refresh();

        then: "I should be redirected to the search page"
        at SearchPage
    }
}
