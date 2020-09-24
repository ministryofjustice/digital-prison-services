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

    void stubUpdateActiveCaseload() {
        this.stubFor(
                put('/api/users/me/activeCaseLoad')
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                        ))
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

    void stubActivities(Caseload caseload, String timeSlot, String date, def offenderNumbers, data = JsonOutput.toJson([])) {
        this.stubFor(
                post("/api/schedules/${caseload.id}/activities?${timeSlot ? 'timeSlot=' + timeSlot + '&' : ''}date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers)))
                        .willReturn(
                                aResponse()
                                        .withBody(data)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    def stubSystemAccessAlerts(List offenderNumbers, Boolean emptyResponse = false) {
        this.stubFor(
                post("/api/bookings/offenderNo/alerts")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                                aResponse()
                                        .withBody(emptyResponse ? JsonOutput.toJson([]) : HouseblockResponse.alertsResponse)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
    }

    def stubAssessments(List offenderNumbers, Boolean emptyResponse = false) {
        this.stubFor(
                post("/api/offender-assessments/CATEGORY")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                                aResponse()
                                        .withBody(emptyResponse ? JsonOutput.toJson([]) : HouseblockResponse.assessmentsResponse)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
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

    def stubAdjudicationHistory(offenderNo, response, queryParams = '') {
        final totalRecords = String.valueOf(response.size())
        this.stubFor(
                get("/api/offenders/${offenderNo}/adjudications" + queryParams)
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(response))
                                        .withHeader('Content-Type', 'application/json')
                                        .withHeader('total-records', totalRecords)
                                        .withHeader('page-limit', resultsPerPage.toString())
                                        .withHeader('page-offset', '0')
                                        .withStatus(200)))

        this.stubFor(
                get("/api/reference-domains/domains/OIC_FINDING")
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson([
                                                [
                                                        domain     : 'OIC_FINDING',
                                                        code       : 'GUILTY',
                                                        description: 'Guilty',
                                                ],
                                                [
                                                        domain     : 'OIC_FINDING',
                                                        code       : 'NOT_GUILTY',
                                                        description: 'Not Guilty',
                                                ],
                                        ]))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
    }


    def stubAdjudicationDetails(offenderNo, adjudicationNo, response) {
        this.stubFor(
                get("/api/offenders/${offenderNo}/adjudications/$adjudicationNo")
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(response))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))

    }


    def stubRecentMovements(movements = []) {
        this.stubFor(
                post("/api/movements/offenders")
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(movements))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
    }

    def stubEnRoute(String agencyId, movements = []) {
        this.stubFor(
                get("/api/movements/${agencyId}/enroute")
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(movements))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
    }

    void stubImage() {
        this.stubFor(
                get(urlPathMatching("/api/bookings/offenderNo/.+/image/data"))
                        .willReturn(aResponse()
                                .withStatus(404)))
    }

    static def extractOffenderNumbers(String json) {
        return (new JsonSlurper().parseText(json) as ArrayList)
                .collect({ a -> a.offenderNo })
                .unique()
                .toList()
    }

    void stubGetMovementsIn(agencyId, movementDate) {
        this.stubFor(
                get("/api/movements/${agencyId}/in/${movementDate.format(DateTimeFormatter.ISO_DATE)}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson([
                                                [
                                                        offenderNo           : 'A1234AA',
                                                        bookingId            : -1L,
                                                        dateOfBirth          : '1980-01-01',
                                                        firstName            : 'AAAAB',
                                                        lastName             : 'AAAAA',
                                                        fromAgencyDescription: 'Hull (HMP)',
                                                        movementTime         : '01:01:45',
                                                        location             : 'LEI-A-01-011'
                                                ],
                                                [
                                                        offenderNo           : 'G0000AA',
                                                        bookingId            : -2L,
                                                        dateOfBirth          : '1980-12-31',
                                                        firstName            : 'AAAAA',
                                                        lastName             : 'AAAAA',
                                                        fromAgencyDescription: 'Outside',
                                                        movementTime         : '23:59:59',
                                                        location             : 'LEI-A-02-011'
                                                ]
                                        ]))))
    }

    void stubGetMovementsOut(agencyId, movementDate) {
        this.stubFor(
                get("/api/movements/${agencyId}/out/${movementDate.format(DateTimeFormatter.ISO_DATE)}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson([
                                                [
                                                        offenderNo       : 'A1234AA',
                                                        dateOfBirth      : '1980-01-01',
                                                        firstName        : 'AAAAB',
                                                        lastName         : 'AAAAA',
                                                        reasonDescription: 'Normal transfer',
                                                        timeOut          : '01:01:45',
                                                ],
                                                [
                                                        offenderNo       : 'G0000AA',
                                                        dateOfBirth      : '1980-12-31',
                                                        firstName        : 'AAAAA',
                                                        lastName         : 'AAAAA',
                                                        reasonDescription: 'Normal transfer',
                                                        timeOut          : '23:59:59',
                                                ]
                                        ]))))
    }

    void stubInReception(agencyId) {
        this.stubFor(
                get("/api/movements/rollcount/${agencyId}/in-reception")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson([
                                                [
                                                        offenderNo : 'A1234AA',
                                                        bookingId  : -1,
                                                        dateOfBirth: '1980-01-01',
                                                        firstName  : 'AAAAB',
                                                        lastName   : 'AAAAA',
                                                ],
                                                [
                                                        offenderNo : 'G0000AA',
                                                        bookingId  : -2,
                                                        dateOfBirth: '1980-12-31',
                                                        firstName  : 'AAAAA',
                                                        lastName   : 'AAAAA',
                                                ]
                                        ]))))
    }

    void stubIepSummariesForBookings(bookings) {
        def response = bookings.collect { booking -> [bookingId: booking, iepLevel: 'Basic'] }
        def queryParameters = bookings.collect { booking -> "bookings=${booking}" }.join("&")

        this.stubFor(
                get("/api/bookings/offenders/iepSummary?${queryParameters}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response)))
        )
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

    void stubCurrentlyOut(long livingUnitId) {

        this.stubFor(
                get("/api/movements/livingUnit/${livingUnitId}/currently-out")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson([
                                                [
                                                        offenderNo : 'A1234AA',
                                                        bookingId  : -1L,
                                                        dateOfBirth: '1980-01-01',
                                                        firstName  : 'AAAAB',
                                                        lastName   : 'AAAAA',
                                                        location   : 'LEI-A-01-011'
                                                ],
                                                [
                                                        offenderNo : 'G0000AA',
                                                        bookingId  : -2L,
                                                        dateOfBirth: '1980-12-31',
                                                        firstName  : 'AAAAA',
                                                        lastName   : 'AAAAA',
                                                        location   : 'LEI-A-02-011'
                                                ]
                                        ]))
                        )
        )
    }

    void stubTotalOut(String agencyId) {

        this.stubFor(
                get("/api/movements/agency/${agencyId}/currently-out")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson([
                                                [
                                                        offenderNo : 'A1234AA',
                                                        bookingId  : -1L,
                                                        dateOfBirth: '1980-01-01',
                                                        firstName  : 'AAAAB',
                                                        lastName   : 'AAAAA',
                                                        location   : 'LEI-A-01-011'
                                                ],
                                                [
                                                        offenderNo : 'G0000AA',
                                                        bookingId  : -2L,
                                                        dateOfBirth: '1980-12-31',
                                                        firstName  : 'AAAAA',
                                                        lastName   : 'AAAAA',
                                                        location   : 'LEI-A-02-011'
                                                ]
                                        ]))
                        )
        )
    }

    void stubLocation(long livingUnitId) {
        this.stubFor(
                get("/api/locations/${livingUnitId}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson([
                                                "locationId"          : livingUnitId,
                                                "locationType"        : "WING",
                                                "description"         : "HB1",
                                                "agencyId"            : "RNI",
                                                "currentOccupancy"    : 243,
                                                "locationPrefix"      : "RNI-HB1",
                                                "internalLocationCode": "HB1"
                                        ]))
                        )
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

    void stubGetAppointmentsForAgency(String agencyId, def response) {
        this.stubFor(
                any(urlPathEqualTo("/api/schedules/${agencyId}/appointments"))
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(response))
                )

        )
    }

    void stubScheduledActivities(agencyId, response) {
        this.stubFor(
                post(urlPathEqualTo("/api/schedules/${agencyId}/activities-by-event-ids"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))
                        )

        )
    }

}
