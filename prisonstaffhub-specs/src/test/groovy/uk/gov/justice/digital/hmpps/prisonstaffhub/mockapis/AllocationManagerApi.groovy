package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get
import static com.github.tomakehurst.wiremock.client.WireMock.post

class TokenVerificationApi extends WireMockRule {

    AllocationManagerApi() {
        super(18084)
    }

    void stubGetAllocation(bookingId, response = []) {
        this.stubFor(
                get(urlPathEqualTo("/api/allocation/${bookingId}"))
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(response))
                )

        )
    }

}
