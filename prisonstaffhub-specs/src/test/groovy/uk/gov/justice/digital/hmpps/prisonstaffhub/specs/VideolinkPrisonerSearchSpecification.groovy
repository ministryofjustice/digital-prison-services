package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.VideolinkPrisonerSearchPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class VideolinkPrisonerSearchSpecification extends BrowserReportingSpec {
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
        to VideolinkPrisonerSearchPage

        when: "I submit"
        submitButton.click()

        then: "I should be presented with an error which says I need to enter prisoner name or number"
        errorSummary.text() == 'There is a problem\nYou must search using either the prisoner\'s last name or prison number'
    }

    def "should handle missing dob fields"() {
        setupTests()

        given: "I navigate to the prisoner search screen and only enter last name and dob day"
        to VideolinkPrisonerSearchPage
        form.lastName = "Offender"

        and: "I show other search details"
        otherSearchDetails.click()
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
                    lastName: 'OFFENDER',
                    dateOfBirth: '1980-07-17',
                    latestLocationId: 'WWI',
                    latestLocation: 'Wandsworth',
                    pncNumber: '1/2345',
                ]
        ])

        given: "I navigate to the prisoner search screen"
        to VideolinkPrisonerSearchPage
        form.lastName = "Offender"

        when: "I submit"
        submitButton.click()

        then: "I should be presented with the the search results"
        searchResultsTable.children()[1].text() == "Test Offender G0011GX 17 July 1980 Wandsworth 1/2345 Book video link\nfor Test Offender, prison number G0011GX"
        bookVlbLinks[0].attr('href') == "http://localhost:3006/WWI/offenders/G0011GX/add-court-appointment"
    }

    def setupTests() {
        fixture.loginAsVideoLinkCourtUser(ITAG_USER)
        elite2api.stubGetAgencies([
                [
                        "description": "MOORLAND (HMP & YOI)",
                        "formattedDescription": "Moorland (HMP & YOI)",
                        "agencyId": "MDI",
                        "agencyType": "INST",
                ],
                [
                        "description": "LEEDS (HMP)",
                        "formattedDescription": "Leeds (HMP)",
                        "agencyId": "LEI",
                        "agencyType": "INST",
                ],
                [
                        "description": "WANDSWORTH (HMP)",
                        "formattedFescription": "Wandsworth (HMP)",
                        "agencyId": "WWI",
                        "agencyType": "INST",
                ]
        ])

    }
}
