package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonOutput

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get
import static com.github.tomakehurst.wiremock.client.WireMock.head
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo

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

    void stubDocuments(offenderNo, documents) {
        this.stubFor(
                get("/api/offenders/nomsNumber/${offenderNo}/documents/grouped")
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(documents))))
    }

    void stubDocument(offenderNo, documentId, content) {
        this.stubFor(
                get("/api/offenders/nomsNumber/${offenderNo}/documents/${documentId}")
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/pdf')
                                .withBody(content)))
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