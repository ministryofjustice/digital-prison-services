package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class SearchSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    TestFixture fixture = new TestFixture(browser, elite2api)

    def "The search page is displayed"() {

        when: "I log in"
        elite2api.stubGroups ITAG_USER.workingCaseload
        fixture.loginAs(ITAG_USER)

        then: 'The search page is displayed'
        at SearchPage
    }

    def "Validation error if neither activity and location are selected"() {
        given: 'I am on the search page'
        fixture.toSearch()

        when: "I deselect both activity and location"
        activity = '--'
        location = '--'
        continueButton.click()

        then: 'an error is displayed'
        at SearchPage
        validationMessage.text() == "Please select location or activity"
    }
}
