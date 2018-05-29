package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.DashboardPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.HouseblockPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class HouseblockSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    TestFixture fixture = new TestFixture(browser, elite2api)

    def "The houseblock list is displayed"() {
        given: 'I am on the whereabouts search page'
        fixture.loginAs(ITAG_USER)
        at DashboardPage
        fixture.clickWhereaboutsLink()
        at SearchPage

        when: "I select and display a location"
        elite2api.stubGetHouseblockList(ITAG_USER.workingCaseload, 'BWing', 'AM')
        form['housing-location-select'] = 'BWing'
        form['period-select'] = 'AM'
        continueButton.click()

        then: 'The houseblock list is displayed'
        at HouseblockPage

        tableRows*.text()[1].contains("Anderson, Arthur LEI-A-1-1 A1234AA Woodwork")
        tableRows*.text()[1].contains("Friends - 18:00")
        tableRows*.text()[2].contains("Balog, Eugene LEI-A-1-2 A1234AB TV Repairs")
    }
}
