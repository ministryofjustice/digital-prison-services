package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.extension.responsetemplating.ResponseTemplateTransformer
import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonOutput
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount

import static com.github.tomakehurst.wiremock.client.WireMock.*
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig

class OauthApi extends WireMockRule {

    OauthApi() {
        super(wireMockConfig().port(19090).extensions(new ResponseTemplateTransformer(true)))
    }

    void stubAuthorizeRequest() {
        this.stubFor(
                get(urlPathEqualTo('/auth/oauth/authorize'))
                        .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader('Content-Type', 'text/html;charset=UTF-8')
                        .withBody('<head><title>Digital Prison Services</title></head>' +
                        '<body><h1>Sign in</h1>This is a stubbed login page' +
                        '<form action="/auth/login?state={{request.requestLine.query.state}}" method="POST" id="loginForm">' +
                        '  <input id="username" name="username" type="text">' +
                        '  <input id="password" name="password" type="password">' +
                        '  <input id="submit" type="submit" value="Sign in">' +
                        '</form>' +
                        '</body>')))

        this.stubFor(
                post(urlPathEqualTo('/auth/login'))
                        .willReturn(temporaryRedirect("http://localhost:3006/login/callback?code=code&state={{request.requestLine.query.state}}")))

        this.stubFor(
                get('/favicon.ico')
                        .willReturn(aResponse().withBody("favicon")))
    }

    void stubAuthorizeLogin() {
        this.stubFor(
                get(urlPathEqualTo('/auth/oauth/authorize'))
                        .willReturn(temporaryRedirect("http://localhost:3006/login/callback?code=code&state={{request.requestLine.query.state}}")))

        this.stubFor(
                get('/favicon.ico')
                        .willReturn(aResponse().withBody("favicon")))
    }

    void stubLogout() {
        this.stubFor(
                get(urlPathEqualTo('/auth/logout'))
                        .willReturn(aResponse().withBody('<head><title>Digital Prison Services</title></head>' +
                        '<body><h1>Sign in</h1>This is a stubbed logout page</body>')
                ))
    }

    void stubValidOAuthTokenLogin(Boolean delayOAuthResponse = false) {
        stubAuthorizeLogin()

        final response = aResponse()
                .withStatus(200)
                .withHeader('Content-Type', 'application/json;charset=UTF-8')
                .withBody(JsonOutput.toJson([
                        access_token : JwtFactory.token(),
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
                        .withRequestBody(equalTo("grant_type=authorization_code&redirect_uri=http%3A%2F%2Flocalhost%3A3006%2Flogin%2Fcallback&client_id=elite2apiclient&client_secret=clientsecret&code=code"))
                        .willReturn(response))
    }

    void stubValidOAuthTokenRequest(Boolean delayOAuthResponse = false) {
        stubAuthorizeRequest()

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
                        .withRequestBody(equalTo("grant_type=authorization_code&redirect_uri=http%3A%2F%2Flocalhost%3A3006%2Flogin%2Fcallback&client_id=elite2apiclient&client_secret=clientsecret&code=code"))
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
                post(urlEqualTo('/auth/oauth/token'))
                        .withHeader('authorization', equalTo('Basic cHJpc29uc3RhZmZodWJjbGllbnQ6Y2xpZW50c2VjcmV0'))
                        .withHeader('Content-Type', equalTo('application/x-www-form-urlencoded'))
                        .withRequestBody(containing("grant_type=client_credentials"))
                        .willReturn(aResponse().withStatus(200)))
    }

    void stubGetMyDetails(UserAccount user) {
        this.stubFor(
                get('/auth/api/user/me')
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson([
                                staffId         : user.staffMember ? user.staffMember.id : null,
                                username        : user.username,
                                firstName       : user.staffMember ? user.staffMember.firstName : '',
                                lastName        : user.staffMember ? user.staffMember.lastName: '',
                                authSource      : user.staffMember ? user.staffMember.authSource: '',
                                email           : 'itaguser@syscon.net',
                                activeCaseLoadId: user.getWorkingCaseload()
                        ]))))
    }

    void stubCustomUserDetails(def username, def response) {
        this.stubFor(
                get("/auth/api/user/${username}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))))
    }

    void stubGetEmail(username, email='') {
        this.stubFor(
                get("/auth/api/user/${username}/email")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson([
                                                email           : email,
                                        ]))))
    }

    void stubGetUserDetails(username, staffName) {
        this.stubFor(
                get("/auth/api/user/${username}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson([
                                                name           : staffName,
                                                username       : username
                                        ]))))
    }

    void stubGetMyRoles(def roles = ['ROLE']) {
        this.stubFor(
                get('/auth/api/user/me/roles')
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(roles))))
    }


    void stubHealth() {
        this.stubFor(
                get('/auth/health/ping')
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'text/plain')
                                        .withBody('ping')))
    }
}
