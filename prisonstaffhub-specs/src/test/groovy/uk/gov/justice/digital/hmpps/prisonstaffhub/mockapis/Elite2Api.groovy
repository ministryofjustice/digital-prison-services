package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonBuilder
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.*
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload

import java.time.format.DateTimeFormatter

import static com.github.tomakehurst.wiremock.client.WireMock.*

class Elite2Api extends WireMockRule {

    Elite2Api() {
        super(18080)
    }

    void stubGetMyCaseloads(List<Caseload> caseloads) {
        stubGetMyCaseloads(caseloads, Caseload.LEI.id)
    }

    final resultsPerPage = 20

    void stubGetMyCaseloads(List<Caseload> caseloads, caseload) {
        def json = new JsonBuilder()
        json caseloads, { cl ->
            caseLoadId cl.id
            description cl.description
            type cl.type
            caseloadFunction 'DUMMY'
            currentlyActive cl.id == caseload
        }

        this.stubFor(
                get('/api/users/me/caseLoads')
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(json.toString())
                        ))
    }

    void stubActivityLocations() {
        this.stubFor(
                get(urlMatching(".+eventLocationsBooked\\?bookedOnDay=....-..-..&timeSlot=.."))
                        .willReturn(
                                aResponse()
                                        .withBody(ActivityLocationsResponse.response)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubActivityLocations(String date, String period) {
        this.stubFor(
                get(urlMatching(".+eventLocationsBooked\\?bookedOnDay=${date}&timeSlot=${period}"))
                        .willReturn(
                                aResponse()
                                        .withBody(ActivityLocationsResponse.response2)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubOffenderDetails(boolean fullInfo, def offender) {
        this.stubFor(
                any(urlPathEqualTo("/api/bookings/offenderNo/${offender.offenderNo}"))
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(offender))))
    }

    def stubGlobalSearch(String offenderNo, String lastName, String firstName, String location, String gender, String dob, response) {
        final totalRecords = String.valueOf(response.size())

        this.stubFor(
                any(urlPathEqualTo("/api/prisoners"))
                        .withQueryParams(Map.of("lastName", equalTo(lastName), "gender", equalTo(gender), "location", equalTo(location), "includeAliases", equalTo('true'), "dob", equalTo(dob)))
                        .withHeader('page-offset', equalTo('0'))
                        .withHeader('page-limit', equalTo(resultsPerPage.toString()))
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(response[0..Math.min(9, response.size() - 1)]))
                                        .withHeader('Content-Type', 'application/json')
                                        .withHeader('total-records', totalRecords)
                                        .withHeader('page-limit', resultsPerPage.toString())
                                        .withHeader('page-offset', '0')
                                        .withStatus(200)))

        this.stubFor(
                any(urlPathEqualTo("/api/prisoners"))
                        .withQueryParams(Map.of("lastName", equalTo(lastName),  "location", equalTo(location)))
                        .willReturn(
                        aResponse()
                                .withBody(JsonOutput.toJson(response[0..Math.min(9, response.size() - 1)]))
                                .withHeader('Content-Type', 'application/json')
                                .withHeader('total-records', totalRecords)
                                .withStatus(200)))
    }

    def stubGlobalSearch(String offenderNo, String lastName, String firstName, response) {
        final totalRecords = String.valueOf(response.size())

        this.stubFor(
                any(urlPathEqualTo("/api/prisoners"))
                        .withQueryParams(Map.of("lastName", equalTo(lastName), "gender", equalTo("ALL"), "location", equalTo("ALL"), "includeAliases", equalTo('true')))
                        .withHeader('page-offset', equalTo('0'))
                        .withHeader('page-limit', equalTo(resultsPerPage.toString()))
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(response[0..Math.min(resultsPerPage - 1, response.size() - 1)]))
                                        .withHeader('Content-Type', 'application/json')
                                        .withHeader('total-records', totalRecords)
                                        .withHeader('page-limit', resultsPerPage.toString())
                                        .withHeader('page-offset', '0')
                                        .withStatus(200)))

        if (response.size() > resultsPerPage - 1) {
            final nextPage = resultsPerPage + (response.size() - resultsPerPage) - 1
            this.stubFor(
                    any(urlPathEqualTo("/api/prisoners"))
                            .withQueryParams(Map.of("lastName", equalTo(lastName), "gender", equalTo("ALL"), "location", equalTo("ALL"), "includeAliases", equalTo('true')))
                            .withHeader('page-offset', equalTo(resultsPerPage.toString()))
                            .withHeader('page-limit', equalTo(resultsPerPage.toString()))
                            .willReturn(
                                    aResponse()
                                            .withBody(JsonOutput.toJson(response[resultsPerPage..nextPage]))
                                            .withHeader('Content-Type', 'application/json')
                                            .withHeader('total-records', totalRecords)
                                            .withHeader('page-limit', resultsPerPage.toString())
                                            .withHeader('page-offset', resultsPerPage.toString())
                                            .withStatus(200)))
        }

        this.stubFor(
                post("/api/movements/offenders")
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(GlobalSearchResponses.lastPrisonResponse))

                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
    }

    void stubGetIepSummaryWithDetails(bookingId, withDetails = true) {
        this.stubFor(
                get("/api/bookings/${bookingId}/iepSummary?withDetails=${withDetails}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(IncentiveLevelHistoryResponse.response1)))
        )
    }

    void stubOffenderDetails(offenderNo, response) {
        this.stubFor(
                get(urlPathEqualTo("/api/bookings/offenderNo/${offenderNo}"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))
                        )
        )
    }

    void stubGetAgencies(response) {
        this.stubFor(
                get("/api/agencies/prison")
                        .willReturn(
                            aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(response))
                )
        )
    }

    void stubAgencyDetails(agencyId, response) {
        this.stubFor(
                get("/api/agencies/${agencyId}?activeOnly=false")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))
                        )
        )
    }

    void stubUserDetails(userId, response) {
        this.stubFor(
                get("/api/users/${userId}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))
                        )
        )
    }

    void stubGetAgencyIepLevels(agencyId, response) {
        this.stubFor(
                get("/api/agencies/${agencyId}/iepLevels")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))
                        )
        )
    }

}
