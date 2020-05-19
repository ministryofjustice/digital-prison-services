package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonOutput

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get

class TokenVerificationApi extends WireMockRule {

    TokenVerificationApi() {
        super(18100)
    }

    void stubHealth() {
        this.stubFor(
                get('/health/ping')
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'text/plain')
                                        .withBody('{"status": "UP"}')))
    }

}
