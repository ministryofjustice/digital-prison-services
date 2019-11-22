package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching

public class NewNomisWebServer extends WireMockRule {

    NewNomisWebServer() {
        super(20200)
    }

    def stubLandingPage() {
        this.stubFor(
                get(urlMatching('.*'))
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'text/html;charset=UTF-8')
                                .withBody('<head><title>Digital Prison Services</title></head>' +
                                        '<body><h1>New nomis ui</h1>This is a stubbed login page' +
                                        '</body>')))
    }
}

