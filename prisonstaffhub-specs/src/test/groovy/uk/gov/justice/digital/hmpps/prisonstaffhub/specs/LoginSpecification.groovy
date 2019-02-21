package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.LoginPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER
import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.NOT_KNOWN

class LoginSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "The login page is present"() {
        when: 'I go to the login page'
        elite2api.stubHealth()
        to LoginPage

        then: 'The Login page is displayed'
        at LoginPage
    }

    def "Default URI redirects to Login page"() {
        when: "I go to the website URL using an empty path"
        elite2api.stubHealth()
        go '/'

        then: 'The Login page is displayed'
        at LoginPage
    }

    def "Log in with valid credentials"() {
        given: 'I am on the Login page'
        elite2api.stubHealth()
        to LoginPage

        oauthApi.stubValidOAuthTokenRequest(ITAG_USER)
        oauthApi.stubGetMyDetails(ITAG_USER)
        oauthApi.stubGetMyRoles()
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        elite2api.stubGroups ITAG_USER.workingCaseload
        elite2api.stubActivityLocations()

        when: "I login using valid credentials"
        loginAs ITAG_USER, 'password'

        then: 'My credentials are accepted and I am shown the Search page'
        at SearchPage
    }

    def "Log in attempt with long delay on oauth server"() {

        given: 'I am on the Login page'
        elite2api.stubHealth()
        to LoginPage

        and: 'The OAuth server responds with a long delay'
        oauthApi.stubValidOAuthTokenRequest(ITAG_USER, true)
        oauthApi.stubGetMyDetails(ITAG_USER)
        oauthApi.stubGetMyRoles()
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        elite2api.stubGroups ITAG_USER.workingCaseload
        elite2api.stubActivityLocations()

        when: "I attempt to log in using valid credentials"
        loginAs ITAG_USER, 'password'

        then: 'My credentials are accepted and I am shown the Search page'
        at SearchPage
    }

    def "Unknown user is rejected"() {

        given: 'I am on the Login page'
        elite2api.stubHealth()
        oauthApi.stubInvalidOAuthTokenRequest(NOT_KNOWN)
        to LoginPage

        when: 'I login using an unknown username'
        loginAs NOT_KNOWN, 'password'

        then: 'I remain on the login page'
        at LoginPage

        and: 'I am told why I couldn\'t log in'
        errors.message == 'The username or password you have entered is invalid.'
    }

    def "Unknown password is rejected"() {
        given: 'I am on the Login page'
        elite2api.stubHealth()
        oauthApi.stubInvalidOAuthTokenRequest(ITAG_USER, true)
        to LoginPage

        when: 'I login using an unknown username'
        loginAs ITAG_USER, 'wildGuess'

        then: 'I remain on the login page'
        at LoginPage

        and: 'I am told why I couldn\'t log in'
        errors.message == 'The username or password you have entered is invalid.'
    }

    def "Log out"() {
        given: "I have logged in"
        fixture.loginAs(ITAG_USER)
        at SearchPage

        when: "I log out"
        header.logout()

        then: "I am taken to the NOTM Login page."
        browser.getCurrentUrl() == 'http://localhost:3000/login'

       /* then: "I am on the dashboard."
        at DashboardPage*/
    }
}
