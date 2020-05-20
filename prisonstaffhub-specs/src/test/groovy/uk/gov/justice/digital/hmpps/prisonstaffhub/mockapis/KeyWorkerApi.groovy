package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get

class KeyWorkerApi extends WireMockRule {

    KeyWorkerApi() {
        super(18081)
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
