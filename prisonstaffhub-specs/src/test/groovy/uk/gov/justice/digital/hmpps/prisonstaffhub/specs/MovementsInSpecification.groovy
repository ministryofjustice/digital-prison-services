package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.InTodayPage

import java.time.LocalDate

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class MovementsInSpecification extends GebReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "in-today"() {

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count In today page"
        elite2api.stubGetMovementsIn(ITAG_USER.workingCaseload, LocalDate.now())
        elite2api.stubImage()
        to InTodayPage

        then:
        at InTodayPage

        def cellTextInRows = tableRows.collect { row -> row.children().collect { cell -> cell.text() } }

        cellTextInRows == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', 'A-02-011', '23:59', 'Outside'],
                ['', 'Aaaaa, Aaaab', 'G0001AA', '01/01/1980', 'A-01-011', '01:01', 'Hull (HMP)']
        ]
    }
}
