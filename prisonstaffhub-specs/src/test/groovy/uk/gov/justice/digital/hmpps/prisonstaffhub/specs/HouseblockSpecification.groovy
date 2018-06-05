package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.HouseblockPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class HouseblockSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    TestFixture fixture = new TestFixture(browser, elite2api)

    def "The houseblock list is displayed"() {
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
        form['housing-location-select'] == 'BWing'
        form['date'] == 'Today'
        form['period-select'] == 'AM'

        def texts = tableRows*.text()
        texts[1].contains("Anderson, Arthur LEI-A-1-1 A1234AA Woodwork")
        texts[1].contains("Friends 18:00")
        texts[2].contains("Balog, Eugene LEI-A-1-2 A1234AB TV Repairs")
    }

    def "The updated houseblock list is displayed"() {
        given: 'I am on the houseblock list page'
        fixture.toSearch()
        def today = new Date().format('YYYY-MM-dd')
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'AWing', 'PM', today)
        form['period-select'] = 'PM'
        continueButton.click()
        at HouseblockPage
        form['housing-location-select'] == 'AWing'

        when: "I change selections and update"
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'BWing', 'PM', today)
        form['housing-location-select'] = 'BWing'
        updateButton.click()

        then: 'The new houseblock list results are displayed'
        at HouseblockPage
        form['housing-location-select'] == 'BWing'
        form['date'] == 'Today'
        form['period-select'] == 'PM'
        def texts = tableRows*.text()
        texts[1].contains("Anderson, Arthur LEI-A-1-1 A1234AA Woodwork")
        texts[2].contains("Balog, Eugene LEI-A-1-2 A1234AB TV Repairs")
    }
}
