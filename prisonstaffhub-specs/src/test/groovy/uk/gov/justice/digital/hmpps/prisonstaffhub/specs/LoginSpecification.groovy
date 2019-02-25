package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.LoginPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class LoginSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "The login page is present"() {
        when: 'I go to the login page'
        oauthApi.stubAuthorizeRequest()
        to LoginPage

        then: 'The Login page is displayed'
        at LoginPage
    }

    def "Default URI redirects to Login page"() {
        when: "I go to the website URL using an empty path"
        oauthApi.stubAuthorizeRequest()
        go '/'

        then: 'The Login page is displayed'
        at LoginPage
    }

    def "Log in with valid credentials"() {
        given: 'I am on the Login page'
        oauthApi.stubValidOAuthTokenRequest()
        to LoginPage

        oauthApi.stubGetMyDetails ITAG_USER
        oauthApi.stubGetMyRoles()
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        elite2api.stubGroups ITAG_USER.workingCaseload
        elite2api.stubActivityLocations()

        when: "I login using valid credentials"
        loginAs ITAG_USER, 'password'

        then: 'My credentials are accepted and I am shown the Search page'
        at SearchPage
    }

    def "Log out"() {
        given: "I have logged in"
        fixture.loginAs ITAG_USER
        at SearchPage

        when: "I log out"
        oauthApi.stubLogout()
        header.logout()

        then: "I am returned to the Login page."
        at LoginPage
    }
}
