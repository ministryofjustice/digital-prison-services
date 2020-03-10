package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.PrisonerSearchPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.PrisonerSearchResultsPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class PrisonerSearchSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should display errors if mandatory fields are empty"() {
        setupTests()

        given: "I navigate to the prisoner search screen and do not fill in any fields"
        to PrisonerSearchPage

        when: "I submit"
        submitButton.click()

        then: "I should be presented with an error which says I need to enter prisoner name or number"
        errorSummary.text() == 'There is a problem\nEnter prisoner name or number'
    }

    def "should handle missing dob fields"() {
        setupTests()

        given: "I navigate to the prisoner search screen and only enter name and dob day"
        to PrisonerSearchPage
        form.nameOrNumber = "Offender, Test"
        form.dobDay = "1"

        when: "I submit"
        submitButton.click()

        then: "I should be presented with an error which says I need enter month and year"
        errorSummary.text() == 'There is a problem\nDate of birth must include a month\nDate of birth must include a year'

        when: "I enter a month and a year but no day"
        form.dobDay = ""
        form.dobMonth = "12"
        form.dobYear = "1980"
        submitButton.click()

        then: "I should be presented with an error which says I need enter a day"
        errorSummary.text() == 'There is a problem\nDate of birth must include a day'
    }

    def "should return search results if name or number entered"() {
        setupTests()
        elite2api.stubGlobalSearch('', 'Offender', 'Test', 'IN', '', '', [
                [
                    offenderNo: 'G0011GX',
                    firstName: 'TEST',
                    middleNames: 'ING',
                    lastName: 'USER',
                    dateOfBirth: '1980-07-17',
                    latestLocationId: 'WWI',
                    latestLocation: 'Wandsworth',
                    pncNumber: '1/2345',
                ]
        ])

        given: "I navigate to the prisoner search screen"
        to PrisonerSearchPage
        form.nameOrNumber = "Offender, Test"

        when: "I submit"
        submitButton.click()

        then: "I should be presented with the the search results page"
        at PrisonerSearchResultsPage
        searchResultsTable.children()[1].text() == "User, Test G0011GX 17/07/1980 Wandsworth 1/2345 Book appointment"
        bookVlbLinks[0].attr('href') == "http://localhost:3006/WWI/offenders/G0011GX/add-court-appointment"
    }

    def setupTests() {
        fixture.loginAsVideoLinkCourtUser(ITAG_USER)
        elite2api.stubGetAgencies([
                [
                        "description": "Moorland (HMP & YOI)",
                        "agencyId": "MDI",
                        "agencyType": "INST",
                ],
                [
                        "description": "Leeds (HMP)",
                        "agencyId": "LEI",
                        "agencyType": "INST",
                ],
                [
                        "description": "Wandsworth (HMP)",
                        "agencyId": "WWI",
                        "agencyType": "INST",
                ]
        ])

    }
}
