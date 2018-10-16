package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.HouseblockPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class HouseblockSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)
    def initialPeriod

    def "The houseblock list is displayed and reordered"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, '1', 'AM', today)
        form['housing-location-select'] = '1'
      //  form['date'] = ??? TODO cannot set input, have to click calendar!
//        datePicker.click()
//        days[0].click() // select 1st of this month for now

        form['period-select'] = 'AM'
        continueButton.click()

        then: 'The houseblock list is displayed, orderded by last name'

        at HouseblockPage
        form['housing-location-select'] == '--'
        form['date'] == 'Today'
        form['period-select'] == 'AM'

        locationOrderLink.text() == 'Location'

        def texts2 = tableRows*.text()

        texts2[1].contains("Anderson, Arthur A-1-1 A1234AA")
        def reorderedRow1 = tableRows[1].find('td')
        reorderedRow1[3].text() == 'Woodwork 17:00'
        reorderedRow1[4].find('li')*.text() == [ '** Court visit scheduled **', 'Visits - Friends 18:00', 'Visits - Friends 18:30 (cancelled)' ];


        // Check order is by name
        texts2[2].contains("Baa, Fred A-1-3 A1234AC")
        def reorderedRow2 = tableRows[2].find('td')
        reorderedRow2[3].text() == 'Chapel 11:45'

        texts2[3].contains("Balog, Eugene A-1-2 A1234AB")
        def reorderedRow3 = tableRows[3].find('td')
        reorderedRow3[3].text() == 'TV Repairs 17:45'


        when: "I order by cell location"
        locationOrderLink.click()

        then: 'The houseblock list is displayed in the new order'

        at HouseblockPage
        printButton[0].displayed
        printButton[1].displayed
        nameOrderLink.text() == 'Name'
        // Check order is by cell
        def texts = tableRows*.text()
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA")
        def row1 = tableRows[1].find('td')
        row1[3].text() == 'Woodwork 17:00'
        row1[4].find('li')*.text() == [ '** Court visit scheduled **', 'Visits - Friends 18:00', 'Visits - Friends 18:30 (cancelled)' ]

        texts[2].contains("Balog, Eugene A-1-2 A1234AB")
        def row2 = tableRows[2].find('td')
        row2[3].text() == 'TV Repairs 17:45'
        row2[4].text() == ''

        texts[3].contains("Baa, Fred A-1-3 A1234AC")
        def row3 = tableRows[3].find('td')
        row3[3].text() == 'Chapel 11:45'
        row3[4].text() == ''

    }

    def "The updated houseblock list is displayed"() {
        given: 'I am on the houseblock list page'
        fixture.toSearch()
        this.initialPeriod = period.value()
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, '1', 'PM', today)
        form['period-select'] = 'PM'
        form['housing-location-select'] = '1'
        continueButton.click()
        at HouseblockPage

        when: "I change selections and update"
        def firstOfMonthDisplayFormat = '01/08/2018'
        def firstOfMonthApiFormat = '2018-08-01'
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, '1_B', 'PM', firstOfMonthApiFormat)
        form['housing-location-select'] = 'B'
        setDatePicker('2018', 'Aug', '1')
        updateButton.click()

        then: 'The new houseblock list results are displayed'
        at HouseblockPage
        form['housing-location-select'] == 'B'
        form['date'] == firstOfMonthDisplayFormat
        form['period-select'] == 'PM'
        def texts = tableRows*.text()
        def row1 = tableRows[1].find('td')
        texts[1].contains("Anderson, Arthur A-1-1 A1234AA")
        row1[3].text() == 'Woodwork 17:00'
        row1[4].find('li')*.text() == ['** Court visit scheduled **', 'Visits - Friends 18:00', 'Visits - Friends 18:30 (cancelled)' ]

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
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, '1', 'PM', today)

        form['housing-location-select'] = '1'
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
        elite2api.stubGetHouseblockListWithMultipleActivities(ITAG_USER.workingCaseload, '1', 'AM', today)

        form['housing-location-select'] = '1'

        form['period-select'] = 'AM'
        continueButton.click()

        then: 'Only one main activity is displayed'
        at HouseblockPage
        locationOrderLink.text() == 'Location'

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
        elite2api.stubGetHouseblockListWithNoActivityOffender(ITAG_USER.workingCaseload, '1', 'AM', today)

        form['housing-location-select'] = '1'

        form['period-select'] = 'AM'
        continueButton.click()

        then: 'Only one activity is displayed'
        at HouseblockPage
        def texts = tableRows*.text()
        texts[1].contains("James, John A-1-12 A1234AH")
        texts[1].contains("non paid act 1 17:10")
        texts[1].contains("hair cut - non paid act 2 19:10")
    }

    def "should indicate that an offender is going to be released today"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: "I select and display a location"
        def today = new Date().format('YYYY-MM-dd')

        elite2api.stubGetHouseblockListWithNoActivityOffender(ITAG_USER.workingCaseload, '1', 'AM', today)
        form['housing-location-select'] = '1'
        form['period-select'] = 'AM'
        continueButton.click()

        then: 'Only one activity is displayed'
        at HouseblockPage
        def texts = tableRows*.text()
        texts[1].contains("James, John A-1-12 A1234AH")
        texts[1].contains("non paid act 1 17:10")
        texts[1].contains("** Release scheduled **")
    }

    def "should indicate that an offender is going to be transferred"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: 'I select and display a location'
        def today = new Date().format('YYYY-MM-dd')

        elite2api.stubGetHouseblockListWithNoActivityOffender(ITAG_USER.workingCaseload, '1', 'AM', today)
        form['housing-location-select'] = '1'
        form['period-select'] = 'AM'
        continueButton.click()

        then: '*** Transfer scheduled *** should be visible in the other activities column'
        at HouseblockPage
        def texts = tableRows*.text()
        texts[2].contains("Anderson, Arthur A-1-1 A1234AA")
        texts[2].contains("** Transfer scheduled **")
    }

    def "should show all court events with the relevant status descriptions"() {
        given: 'I am on the whereabouts search page'
        fixture.toSearch()

        when: 'I select and display a location'
        def today = new Date().format('YYYY-MM-dd')

        elite2api.stubGetHouseBlockListWithAllCourtEvents(ITAG_USER.workingCaseload, '1', 'AM', today)
        form['housing-location-select'] = '1'
        form['period-select'] = 'AM'
        continueButton.click()

        then: 'I should see three court events in the other activities column'
        at HouseblockPage
        def texts = tableRows*.text()
        texts[2].contains("Anderson, Arthur A-1-1 A1234AA")
        texts[2].contains("** Court visit scheduled **")
        texts[2].contains("** Court visit scheduled ** (complete)")
        texts[2].contains("** Court visit scheduled ** (expired)")

    }
}
