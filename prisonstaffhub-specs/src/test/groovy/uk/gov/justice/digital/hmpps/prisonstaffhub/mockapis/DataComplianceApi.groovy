package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.*

import static com.github.tomakehurst.wiremock.client.WireMock.*

class DataComplianceApi extends WireMockRule {

    DataComplianceApi() {
        super(18084)
    }

    void stubGetOffenderRetentionReasons() {
        this.stubFor(
                get('/retention/offenders/retention-reasons')
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(DataComplianceResponses.retentionReasons)
                        ))
    }
}
