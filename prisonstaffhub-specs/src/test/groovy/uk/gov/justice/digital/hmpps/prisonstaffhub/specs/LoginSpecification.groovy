package uk.gov.justice.digital.hmpps.keyworker.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import spock.lang.Ignore
import uk.gov.justice.digital.hmpps.keyworker.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.keyworker.model.TestFixture
import uk.gov.justice.digital.hmpps.keyworker.pages.KeyworkerManagementPage
import uk.gov.justice.digital.hmpps.keyworker.pages.LoginPage

import static uk.gov.justice.digital.hmpps.keyworker.model.UserAccount.ITAG_USER
import static uk.gov.justice.digital.hmpps.keyworker.model.UserAccount.NOT_KNOWN

class LoginSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    TestFixture fixture = new TestFixture(browser, elite2api, null)

    def "The login page is present"() {
        when: 'I go to the login page'
        to LoginPage

        then: 'The Login page is displayed'
        at LoginPage
    }

    def "Default URI redirects to Login page"() {
        when: "I go to the website URL using an empty path"
        go '/'

        then: 'The Login page is displayed'
        at LoginPage
    }

    def "Log in with valid credentials"() {
        given: 'I am on the Login page'
        to LoginPage

        elite2api.stubValidOAuthTokenRequest(ITAG_USER)
        elite2api.stubGetMyDetails(ITAG_USER)
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)

        when: "I login using valid credentials"
        loginAs ITAG_USER, 'password'

        then: 'My credentials are accepted and I am shown the Key worker management page'
        at KeyworkerManagementPage
    }

    @Ignore
    def "Log in attempt with long delay on oauth server"() {

        given: 'I am on the Login page'
        to LoginPage

        and: 'The OAuth server responds with a long delay'
        elite2api.stubValidOAuthTokenRequest(ITAG_USER, true)
        elite2api.stubGetMyDetails(ITAG_USER)
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)

        when: "I attempt to log in using valid credentials"
        loginAs ITAG_USER, 'password'

        then: 'My credentials are accepted and I am shown the Key worker management page'
        at KeyworkerManagementPage
    }

    def "Unknown user is rejected"() {

        given: 'I am on the Login page'
        elite2api.stubInvalidOAuthTokenRequest(NOT_KNOWN)
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
        elite2api.stubInvalidOAuthTokenRequest(ITAG_USER, true)
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

        when: "I log out"
        header.logout()

        then: "I am returned to the Login page."
        at LoginPage
    }
}
