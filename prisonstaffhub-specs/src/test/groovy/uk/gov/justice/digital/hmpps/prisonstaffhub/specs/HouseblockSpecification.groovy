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
      //  form['date'] = today TODO cannot set input, have to click calendar!
        form['period-select'] = 'AM'
        continueButton.click()

        then: 'The houseblock list is displayed'
        at HouseblockPage

        tableRows*.text()[9].contains("Anderson, Arthur LEI-A-1-1 A1234AA Woodwork")
        tableRows*.text()[9].contains("Friends 18:00")
        tableRows*.text()[10].contains("Balog, Eugene LEI-A-1-2 A1234AB TV Repairs")
    }
}
