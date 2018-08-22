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
    def initialPeriod

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
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA")
        def row1 = tableRows[1].find('td')
        row1[3].text() == 'Woodwork 17:00'
        row1[4].text() == 'Visits - Friends 18:00'

        texts[2].contains("Balog, Eugene A-1-2 A1234AB")
        def row2 = tableRows[2].find('td')
        row2[3].text() == 'TV Repairs 17:45'
        row2[4].text() == ''

        texts[3].contains("Baa, Fred A-1-3 A1234AC")
        def row3 = tableRows[3].find('td')
        row3[3].text() == 'Chapel 11:45'
        row3[4].text() == ''

        when: "I order by name"
        nameOrderLink.click()

        then: 'The houseblock list is displayed in the new order'
        at HouseblockPage
        form['housing-location-select'] == 'BWing'
        form['date'] == 'Today'
        form['period-select'] == 'AM'

        def texts2 = tableRows*.text()

        texts2[1].contains("Anderson, Arthur A-1-1 A1234AA")
        def reorderedRow1 = tableRows[1].find('td')
        reorderedRow1[3].text() == 'Woodwork 17:00'
        reorderedRow1[4].text() == 'Visits - Friends 18:00'

        // Check order is by name
        texts2[2].contains("Baa, Fred A-1-3 A1234AC")
        def reorderedRow2 = tableRows[2].find('td')
        reorderedRow2[3].text() == 'Chapel 11:45'

        texts2[3].contains("Balog, Eugene A-1-2 A1234AB")
        def reorderedRow3 = tableRows[3].find('td')
        reorderedRow3[3].text() == 'TV Repairs 17:45'
    }

    def "The updated houseblock list is displayed"() {
        given: 'I am on the houseblock list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'AWing', 'PM', today)
        form['period-select'] = 'PM'
        form['housing-location-select'] = 'AWing'
        continueButton.click()
        at HouseblockPage

        when: "I change selections and update"
        def firstOfMonthDisplayFormat = '01/08/2018'
        def firstOfMonthApiFormat = '2018-08-01'
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'BWing', 'PM', firstOfMonthApiFormat)
        form['housing-location-select'] = 'BWing'
        setDatePicker('2018', 'Aug', '1')
        updateButton.click()

        then: 'The new houseblock list results are displayed'
        at HouseblockPage
        form['housing-location-select'] == 'BWing'
        form['date'] == firstOfMonthDisplayFormat
        form['period-select'] == 'PM'
        def texts = tableRows*.text()
        def row1 = tableRows[1].find('td')
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA")
        row1[3].text() == 'Woodwork 17:00'
        row1[4].text() == 'Visits - Friends 18:00'

        def row2 = tableRows[2].find('td')
        texts[2].contains("Balog, Eugene A-1-2 A1234AB")
        row2[3].text() == 'TV Repairs 17:45'

        when: "I go to the search page afresh"
        browser.to SearchPage

        then: 'The selections are reinitialised'
        at SearchPage
        location.value() == '--'
        date.value() == 'Today'
        period.value() == this.initialPeriod
    }

    def "should navigate to the whereabouts search on a page refresh"() {
        given: 'I am on the houseblock list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'AWing', 'PM', today)
        form['housing-location-select'] = 'AWing'
        form['period-select'] = 'PM'
        continueButton.click()
        at HouseblockPage

        when: "I refresh the page"
        driver.navigate().refresh()

        then: "I should be redirected to the search page"
        at SearchPage
    }

    def "A prisoner with 2 activities in the same time period should only have the earliest displayed"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockListWithMultipleActivities(ITAG_USER.workingCaseload, 'BWing', 'AM', today)
        form['housing-location-select'] = 'BWing'

        form['period-select'] = 'AM'
        continueButton.click()

        then: 'Only one main activity is displayed'
        at HouseblockPage
        nameOrderLink.text() == 'Name'

        def texts = tableRows*.text()
        def row1 = tableRows[1].find('td')
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA")
        row1[3].text().contains('Woodwork 17:00')
        row1[4].text().contains('conflict activity 16:50')
        row1[0].find("a", href: endsWith('/offenders/A1234AA/quick-look')).size() == 1
    }

    def "A prisoner with 0 activities should be displayed correctly"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockListWithNoActivityOffender(ITAG_USER.workingCaseload, 'BWing', 'AM', today)
        form['housing-location-select'] = 'BWing'

        form['period-select'] = 'AM'
        continueButton.click()

        then: 'Only one activity is displayed'
        at HouseblockPage
        def texts = tableRows*.text()
        texts[1].contains("James, John A-1-12 A1234AH")
        texts[1].contains("non paid act 1 17:10")
        texts[1].contains("hair cut - non paid act 2 19:10")
    }
}
