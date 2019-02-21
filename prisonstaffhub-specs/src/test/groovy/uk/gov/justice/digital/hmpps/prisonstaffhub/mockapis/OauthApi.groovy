package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonOutput
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount

import static com.github.tomakehurst.wiremock.client.WireMock.*

class OauthApi extends WireMockRule {

    OauthApi() {
        super(9090)
    }

    void stubValidOAuthTokenRequest(UserAccount user, Boolean delayOAuthResponse = false) {

        final accessToken = JwtFactory.token()

        final response = aResponse()
                .withStatus(200)
                .withHeader('Content-Type', 'application/json;charset=UTF-8')
                .withBody(JsonOutput.toJson([
                access_token : accessToken,
                token_type   : 'bearer',
                refresh_token: JwtFactory.token(),
                expires_in   : 599,
                scope        : 'read write',
                internalUser : true
        ]))

        if (delayOAuthResponse) {
            response.withFixedDelay(5000)
        }

        this.stubFor(
                post('/auth/oauth/token')
                        .withHeader('authorization', equalTo('Basic ZWxpdGUyYXBpY2xpZW50OmNsaWVudHNlY3JldA=='))
                        .withHeader('Content-Type', equalTo('application/x-www-form-urlencoded'))
                        .withRequestBody(equalTo("username=${user.username}&password=password&grant_type=password"))
                        .willReturn(response))
    }

    void stubInvalidOAuthTokenRequest(UserAccount user, boolean badPassword = false) {
        this.stubFor(
                post('/auth/oauth/token')
                        .withHeader('authorization', equalTo('Basic ZWxpdGUyYXBpY2xpZW50OmNsaWVudHNlY3JldA=='))
                        .withHeader('Content-Type', equalTo('application/x-www-form-urlencoded'))
                        .withRequestBody(matching("username=${user.username}&password=.*&grant_type=password"))
                        .willReturn(
                        aResponse()
                                .withStatus(400)
                                .withBody(JsonOutput.toJson([
                                error            : 'invalid_grant',
                                error_description:
                                        badPassword ?
                                                "invalid authorization specification - not found: ${user.username}"
                                                :
                                                "invalid authorization specification"
                        ]))))
    }

    void stubSystemUserTokenRequest() {
        this.stubFor(
                post('/auth/oauth/token')
                        .withHeader('authorization', equalTo('Basic cHJpc29uc3RhZmZodWJjbGllbnQ6Y2xpZW50c2VjcmV0'))
                        .withHeader('Content-Type', equalTo('application/x-www-form-urlencoded'))
                        .withRequestBody(equalTo("grant_type=client_credentials"))
                        .willReturn(aResponse().withStatus(200)))
    }

    void stubGetMyDetails(UserAccount user) {
        stubGetMyDetails(user, Caseload.LEI.id)
    }

    void stubGetMyDetails(UserAccount user, String caseloadId) {
        this.stubFor(
                get('/auth/api/user/me')
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson([
                                staffId         : user.staffMember.id,
                                username        : user.username,
                                firstName       : user.staffMember.firstName,
                                lastName        : user.staffMember.lastName,
                                email           : 'itaguser@syscon.net',
                                activeCaseLoadId: caseloadId
                        ]))))
    }

    void stubGetMyRoles() {
        this.stubFor(
                get('/auth/api/user/me/roles')
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(['ROLE']))))
    }
}
