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

    void stubNoExistingOffenderRecord() {
        this.stubFor(
                get('/retention/offenders/A12345')
                        .willReturn(
                                aResponse()
                                        .withStatus(404)
                        ))
    }

    void stubExistingOffenderRecord() {
        this.stubFor(
                get('/retention/offenders/A12345')
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withHeader('ETag', '"0"')
                                        .withBody(DataComplianceResponses.existingRetentionRecord)
                        ))
    }

    void stubCreateOffenderRecord() {
        this.stubFor(
                put('/retention/offenders/A12345')
                        .withRequestBody(equalToJson('{ "retentionReasons": [ ' +
                                '{ "reasonCode": "HIGH_PROFILE" },' +
                                '{ "reasonCode": "OTHER", "reasonDetails": "Some other reason" }' +
                                ']}'))
                        .willReturn(
                                aResponse()
                                        .withStatus(201)
                        ))
    }

    void stubUpdateOffenderRecord() {
        this.stubFor(
                put('/retention/offenders/A12345')
                        .withHeader('if-match', equalToJson('"0"'))
                        .withRequestBody(equalToJson('{ "retentionReasons": [ { "reasonCode": "HIGH_PROFILE" } ]}'))
                        .willReturn(
                                aResponse()
                                        .withStatus(201)
                        ))
    }
}
