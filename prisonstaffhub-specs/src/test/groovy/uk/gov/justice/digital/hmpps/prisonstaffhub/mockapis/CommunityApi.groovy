package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonOutput

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get

class CommunityApi extends WireMockRule {

    CommunityApi() {
        super(18083)
    }

    void stubConvictions(offenderNo, convictions) {
        this.stubFor(
                get("/api/offenders/nomsNumber/${offenderNo}/convictions")
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(convictions))))
    }

    void stubOffenderDetails(offenderNo, details) {
        this.stubFor(
                get("/api/offenders/nomsNumber/${offenderNo}")
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(details))))
    }

    void stubHealth() {
        this.stubFor(
                get('/ping')
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'text/plain')
                                        .withBody('ping')))
    }

}