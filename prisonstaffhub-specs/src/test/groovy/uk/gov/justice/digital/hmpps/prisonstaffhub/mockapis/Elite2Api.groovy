package uk.gov.justice.digital.hmpps.keyworker.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonBuilder
import groovy.json.JsonOutput
import uk.gov.justice.digital.hmpps.keyworker.mockapis.mockResponses.OffenderAssessmentsResponse
import uk.gov.justice.digital.hmpps.keyworker.mockapis.mockResponses.OffenderSearchResponse
import uk.gov.justice.digital.hmpps.keyworker.mockapis.mockResponses.OffenderSentencesResponse
import uk.gov.justice.digital.hmpps.keyworker.model.AgencyLocation
import uk.gov.justice.digital.hmpps.keyworker.model.Caseload
import uk.gov.justice.digital.hmpps.keyworker.model.Location
import uk.gov.justice.digital.hmpps.keyworker.model.UserAccount

import static com.github.tomakehurst.wiremock.client.WireMock.*

class Elite2Api extends WireMockRule {

    Elite2Api() {
        super(8080)
    }

    void stubValidOAuthTokenRequest(UserAccount user, Boolean delayOAuthResponse = false) {
        final response = aResponse()
                .withStatus(200)
                .withHeader('Content-Type', 'application/json;charset=UTF-8')
                .withBody(JsonOutput.toJson([
                access_token : 'RW_TOKEN',
                token_type   : 'bearer',
                refresh_token: 'refreshToken',
                expires_in   : 599,
                scope        : 'read write',
                internalUser : true
        ]))

        if (delayOAuthResponse) {
            response.withFixedDelay(5000)
        }

        stubFor(
                post('/oauth/token')
                        .withHeader('authorization', equalTo('Basic b21pYzpjbGllbnRzZWNyZXQ='))
                        .withHeader('Content-Type', equalTo('application/x-www-form-urlencoded'))
                        .withRequestBody(equalTo("username=${user.username}&password=password&grant_type=password&client_id=omic"))
                        .willReturn(response))

    }

    void stubInvalidOAuthTokenRequest(UserAccount user, boolean badPassword = false) {
        stubFor(
                post('/oauth/token')
                        .withHeader('authorization', equalTo('Basic b21pYzpjbGllbnRzZWNyZXQ='))
                        .withHeader('Content-Type', equalTo('application/x-www-form-urlencoded'))
                        .withRequestBody(matching("username=${user.username}&password=.*&grant_type=password&client_id=omic"))
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


    void stubGetMyDetails(UserAccount user) {
        stubFor(
                get('/api/users/me')
                        .withHeader('authorization', equalTo('Bearer RW_TOKEN'))
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
                                activeCaseLoadId: 'LEI'
                        ]))))
    }

    void stubGetMyCaseloads(List<Caseload> caseloads) {
        def json = new JsonBuilder()
        json caseloads, { caseload ->
            caseLoadId caseload.id
            description caseload.description
            type caseload.type
            caseloadFunction 'DUMMY'
        }

        stubFor(
                get('/api/users/me/caseLoads')
                        .withHeader('authorization', equalTo('Bearer RW_TOKEN'))
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(json.toString())
                ))
    }

    void stubGetMyLocations(List<Location> locations) {

        JsonBuilder json = new JsonBuilder()
        json locations, {
            locationId it.locationId
            locationType it.locationType
            description it.description
            agencyId it.agencyId
            if (it.currentOccupancy != null) currentOccupancy it.currentOccupancy
            locationPrefix it.locationPrefix
            if (it.userDescription) userDescription it.userDescription
        }

        stubFor(
                get('/api/users/me/locations')
                        .withHeader('authorization', equalTo('Bearer RW_TOKEN'))
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(json.toString())
        ))
    }


    void stubOffenderSentenceResponse(AgencyLocation agencyLocation) {
        stubFor(
                post(urlPathEqualTo("/api/offender-sentences"))
                        .withHeader('authorization', equalTo('Bearer RW_TOKEN'))
                        .willReturn(aResponse()
                        .withBody(OffenderSentencesResponse.response)
                        .withStatus(200))
        )
    }

    void stubOffenderAssessmentResponse(AgencyLocation agencyLocation) {
        stubFor(
                post(urlPathEqualTo("/api/offender-assessments/CSR"))
                        .withHeader('authorization', equalTo('Bearer RW_TOKEN'))
                        .willReturn(aResponse()
                        .withBody(OffenderAssessmentsResponse.response)
                        .withStatus(200))
        )
    }

    void stubOffenderSearchResponse(AgencyLocation agencyLocation) {
        stubFor(
                get(urlPathEqualTo("/api/locations/description/${agencyLocation.id}/inmates"))
                        .withHeader('authorization', equalTo('Bearer RW_TOKEN'))
                        .willReturn(aResponse()
                        .withBody(OffenderSearchResponse.response_5_results)
                        .withStatus(200))
        )
    }

    void stubOffenderSearchLargeResponse(AgencyLocation agencyLocation) {
        stubFor(
                get(urlPathEqualTo("/api/locations/description/${agencyLocation.id}/inmates"))
                        .withHeader('authorization', equalTo('Bearer RW_TOKEN'))
                        .willReturn(aResponse()
                        .withBody(OffenderSearchResponse.response_55_results)
                        .withStatus(200))
        )
    }

    void stubEmptyOffenderSearchResponse(AgencyLocation agencyLocation) {
        stubFor(
                get(urlPathEqualTo("/api/locations/description/${agencyLocation.id}/inmates"))
                        .withHeader('authorization', equalTo('Bearer RW_TOKEN'))
                        .willReturn(aResponse()
                        .withBody("[]")
                        .withStatus(200))
        )
    }

    void stubHealth() {
        stubFor(
            get('/health')
                .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader('Content-Type', 'application/json')
                    .withBody('''
                {
                    "status": "UP",
                    "healthInfo": {
                        "status": "UP",
                        "version": "version not available"
                    },
                    "diskSpace": {
                        "status": "UP",
                        "total": 510923390976,
                        "free": 143828922368,
                        "threshold": 10485760
                    },
                    "db": {
                        "status": "UP",
                        "database": "HSQL Database Engine",
                        "hello": 1
                    }
                }'''.stripIndent())
        ))
    }
}
