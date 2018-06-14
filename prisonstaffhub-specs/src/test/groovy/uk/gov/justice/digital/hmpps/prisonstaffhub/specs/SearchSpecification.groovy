package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.AgencyLocation
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.DashboardPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class SearchSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    TestFixture fixture = new TestFixture(browser, elite2api)

    def "The search page is displayed"() {
        given: 'I am on the dashboard'
        fixture.loginAs(ITAG_USER)
        at DashboardPage

        when: "I select the whereabouts link"
        elite2api.stubGroups ITAG_USER.workingCaseload
        fixture.clickWhereaboutsLink()

        then: 'The search page is displayed'
        at SearchPage
    }

    def "Validation error if neither activity and location are selected"() {
        given: 'I am on the search page'
        atSearchPage()

        when: "I deselect both activity and location"
        activity = '--'
        location = '--'
        continueButton.click()

        then: 'an error is displayed'
        at SearchPage
        validationMessage.text() == "Please select location or activity"
    }

    def atSearchPage(){
        fixture.loginAs(ITAG_USER)
        at DashboardPage
        elite2api.stubGroups ITAG_USER.workingCaseload
        fixture.clickWhereaboutsLink()
        at SearchPage
    }
}
