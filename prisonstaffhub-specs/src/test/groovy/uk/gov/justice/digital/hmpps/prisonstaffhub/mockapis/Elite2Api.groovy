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

    void stubHealth() {
        this.stubFor(
                get('/ping')
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'text/plain')
                                        .withBody('ping')))
    }

    void stubDelayedError(url, status) {
        this.stubFor(
                get(url)
                        .willReturn(
                                aResponse()
                                        .withStatus(status)
                                        .withFixedDelay(3000)))
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

    void stubGroups(Caseload caseload) {

        def json = JsonOutput.toJson([
                [name: '1', key: '1', children: [
                        [name: 'A', key: 'A'], [name: 'B', key: 'B'], [name: 'C', key: 'C']
                ]],
                [name: '2', key: '2', children: [
                        [name: 'A', key: 'A'], [name: 'B', key: 'B'], [name: 'C', key: 'C']
                ]],
                [name: '3', key: '3', children: [
                        [name: 'A', key: 'A'], [name: 'B', key: 'B'], [name: 'C', key: 'C']
                ]]])
        def jsonSYI = JsonOutput.toJson([
                [name: 'block1', key: 'block1', children: [
                        [name: 'A', key: 'A'], [name: 'B', key: 'B']
                ]],
                [name: 'block2', key: 'block2', children: [
                        [name: 'A', key: 'A'], [name: 'B', key: 'B'], [name: 'C', key: 'C']
                ]]])

        this.stubFor(
                get("/api/agencies/${caseload.id}/locations/groups")
                        .willReturn(
                                aResponse()
                                        .withBody(caseload.id.equals('SYI') ? jsonSYI : json)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubGetHouseblockList(Caseload caseload, String groupName, String timeSlot, String date) {
        this.stubFor(
                get("/api/schedules/${caseload.id}/groups/${groupName}?date=${date}&timeSlot=${timeSlot}")
                        .willReturn(
                                aResponse()
                                        .withBody(HouseblockResponse.responseCellOrder)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
        this.stubFor(
                get("/api/schedules/${caseload.id}/groups/${groupName}?date=${date}&timeSlot=${timeSlot}")
                        .withHeader('Sort-Fields', equalTo('lastName'))
                        .willReturn(
                                aResponse()
                                        .withBody(HouseblockResponse.responseNameOrder)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )

        def offenderNumbers = extractOffenderNumbers(HouseblockResponse.responseCellOrder)
        //order does not matter here
        stubSentenceData(offenderNumbers, date, true)
        stubCourtEvents(caseload, offenderNumbers, date)
        stubExternalTransfers(caseload, offenderNumbers, date, true)
        stubAlerts(offenderNumbers)
        stubAssessments(offenderNumbers)
    }

    void stubGetHouseblockListWithMultipleActivities(Caseload caseload, String groupName, String timeSlot, String date) {
        this.stubFor(
                get("/api/schedules/${caseload.id}/groups/${groupName}?date=${date}&timeSlot=${timeSlot}")
                        .willReturn(
                                aResponse()
                                        .withBody(HouseblockResponse.responseMultipleActivities)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )

        def offenderNumbers = extractOffenderNumbers(HouseblockResponse.responseMultipleActivities)
        stubSentenceData(offenderNumbers, date)
        stubCourtEvents(caseload, offenderNumbers, date)
        stubExternalTransfers(caseload, offenderNumbers, date, true)
        stubAlerts(offenderNumbers)
        stubAssessments(offenderNumbers)
    }

    void stubGetHouseblockListWithNoActivityOffender(Caseload caseload, String groupName, String timeSlot, String date) {
        this.stubFor(
                get("/api/schedules/${caseload.id}/groups/${groupName}?date=${date}&timeSlot=${timeSlot}")
                        .willReturn(
                                aResponse()
                                        .withBody(HouseblockResponse.responseNoActivities)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )

        def offenderNumbers = extractOffenderNumbers(HouseblockResponse.responseNoActivities)
        stubSentenceData(offenderNumbers, date)
        stubCourtEvents(caseload, offenderNumbers, date)
        stubExternalTransfers(caseload, offenderNumbers, date)
        stubAlerts(offenderNumbers)
        stubAssessments(offenderNumbers)
    }

    void stubGetHouseblockListWithAllCourtEvents(Caseload caseload, String groupName, String timeSlot, String date) {
        this.stubFor(
                get("/api/schedules/${caseload.id}/groups/${groupName}?date=${date}&timeSlot=${timeSlot}")
                        .willReturn(
                                aResponse()
                                        .withBody(HouseblockResponse.responseNoActivities)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )

        def offenderNumbers = extractOffenderNumbers(HouseblockResponse.responseNoActivities)
        stubSentenceData(offenderNumbers, date, true)
        stubExternalTransfers(caseload, offenderNumbers, date, true)
        stubAlerts(offenderNumbers)
        stubAssessments(offenderNumbers)

        this.stubFor(
                post("/api/schedules/LEI/courtEvents?date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                                aResponse()
                                        .withBody(HouseblockResponse.courtEventsWithDifferentStatuesResponse)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))

    }

    void stubProgEventsAtLocation(int locationId, String timeSlot, String date, def data = JsonOutput.toJson([]), Boolean suspended = true) {
        this.stubFor(
                get("/api/schedules/locations/${locationId}/activities?${timeSlot ? 'timeSlot=' + timeSlot + '&' : ''}date=${date}&includeSuspended=${suspended}")
                        .willReturn(
                                aResponse()
                                        .withBody(data)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubVisitsAtLocation(Caseload caseload, int locationId, String timeSlot, String date) {
        this.stubFor(
                get("/api/schedules/${caseload.id}/locations/${locationId}/usage/VISIT?${timeSlot ? 'timeSlot=' + timeSlot + '&' : ''}date=${date}")
                        .willReturn(
                                aResponse()
                                        .withBody('[]')
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubUsageAtLocation(Caseload caseload, int locationId, String timeSlot, String date, String usage) {
        this.stubFor(
                get("/api/schedules/${caseload.id}/locations/${locationId}/usage/${usage}?${timeSlot ? 'timeSlot=' + timeSlot + '&' : ''}date=${date}")
                        .willReturn(
                                aResponse()
                                        .withBody('[]')
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubVisits(Caseload caseload, String timeSlot, String date, def offenderNumbers, data = JsonOutput.toJson([])) {
        this.stubFor(
                post("/api/schedules/${caseload.id}/visits?${timeSlot ? 'timeSlot=' + timeSlot + '&' : ''}date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers)))
                        .willReturn(
                                aResponse()
                                        .withBody(data)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubAppointments(Caseload caseload, String timeSlot, String date, def offenderNumbers, data = JsonOutput.toJson([])) {
        this.stubFor(
                post("/api/schedules/${caseload.id}/appointments?${timeSlot ? 'timeSlot=' + timeSlot + '&' : ''}date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers)))
                        .willReturn(
                                aResponse()
                                        .withBody(data)
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

    void stubCourtEvents(Caseload caseload, def offenderNumbers, String date, data = JsonOutput.toJson([])) {
        this.stubFor(
                post("/api/schedules/${caseload.id}/courtEvents?date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                                aResponse()
                                        .withBody(data)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
    }

    void stubGetActivityList(Caseload caseload, int locationId, String timeSlot, String date, Boolean inThePast = false) {

        def activityResponse = inThePast ? ActivityResponse.pastActivities : ActivityResponse.activities

        stubProgEventsAtLocation(locationId, timeSlot, date, activityResponse)

        def offenderNumbers = extractOffenderNumbers(activityResponse)

        stubVisitsAtLocation(caseload, locationId, timeSlot, date)
        stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP')

        stubVisits(caseload, timeSlot, date, offenderNumbers, ActivityResponse.visits)
        stubAppointments(caseload, timeSlot, date, offenderNumbers, ActivityResponse.appointments)
        stubActivities(caseload, timeSlot, date, offenderNumbers, activityResponse)
        stubCourtEvents(caseload, offenderNumbers, date, HouseblockResponse.courtEventsWithDifferentStatuesResponse)
        stubExternalTransfers(caseload, offenderNumbers, date)
        stubAlerts(offenderNumbers)
        stubAssessments(offenderNumbers)

        this.stubFor(
                post("/api/offender-sentences")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers)))
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson([[
                                                                             "offenderNo"    : ActivityResponse.activity3.offenderNo,
                                                                             "sentenceDetail": ["releaseDate": date]
                                                                     ]]))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )

    }

    def stubSentenceData(List offenderNumbers, String formattedReleaseDate, Boolean emptyResponse = false) {
        def index = 0

        def response = emptyResponse ? [] : offenderNumbers.collect({ no ->
            [
                    "offenderNo"    : no,
                    "firstName"     : "firstName-${index++}",
                    "lastName"      : "lastName-${index++}",
                    "sentenceDetail": ["releaseDate": formattedReleaseDate]
            ]
        })

        this.stubFor(
                post("/api/offender-sentences")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(response))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    def stubCourtEvents(Caseload caseload, List offenderNumbers, String date, Boolean emptyResponse = false) {
        def json = emptyResponse ? JsonOutput.toJson([]) : HouseblockResponse.courtEventsResponse

        this.stubFor(
                post("/api/schedules/${caseload.id}/courtEvents?date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                                aResponse()
                                        .withBody(json)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
    }

    def stubExternalTransfers(Caseload caseload, List offenderNumbers, String date, Boolean emptyResponse = false) {
        def json = emptyResponse ? JsonOutput.toJson([]) : HouseblockResponse.externalTransfersResponse

        this.stubFor(
                post("/api/schedules/${caseload.id}/externalTransfers?date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                                aResponse()
                                        .withBody(json)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
    }

    def stubAlerts(List offenderNumbers, Boolean emptyResponse = false) {
        this.stubFor(
                post("/api/bookings/offenderNo/LEI/alerts")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                                aResponse()
                                        .withBody(emptyResponse ? JsonOutput.toJson([]) : HouseblockResponse.alertsResponse)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200)))
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
                get("/api/bookings/offenderNo/${offender.offenderNo}?fullInfo=${fullInfo}")
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


    def stubEstablishmentRollCount(String agencyId) {
        this.stubFor(
                get("/api/movements/rollcount/${agencyId}?unassigned=false")
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(EstablishmentRollResponses.assignedResponse))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )

        this.stubFor(
                get("/api/movements/rollcount/${agencyId}?unassigned=true")
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(EstablishmentRollResponses.unassignedResponse))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )

        this.stubFor(
                get("/api/movements/rollcount/${agencyId}/movements")
                        .willReturn(
                                aResponse()
                                        .withBody(JsonOutput.toJson(EstablishmentRollResponses.movementBlockResponse))
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )

        this.stubFor(
                get("/api/movements/rollcount/${agencyId}/enroute")
                        .willReturn(
                                aResponse()
                                        .withBody('6')
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubAllOtherEventsOnActivityLists(caseload, timeSlot, date, offenders) {
        stubVisits(caseload, timeSlot, date, offenders)
        stubAppointments(caseload, timeSlot, date, offenders)
        stubActivities(caseload, timeSlot, date, offenders)
        stubSentenceData(offenders, date)
        stubCourtEvents(caseload, offenders, date)

        stubExternalTransfers(caseload, offenders, date)
        stubAlerts(offenders)
        stubAssessments(offenders)
    }

    void stubImage() {
        this.stubFor(
                get(urlMatching("/api/bookings/offenderNo/.+/image/data"))
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

    void stubGetIepSummaryWithDetails(bookingId) {
        this.stubFor(
                get("/api/bookings/${bookingId}/iepSummary?withDetails=true")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(IepHistoryResponse.response1)))
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

    void stubAppointmentLocations(String agencyId, def response) {
        this.stubJsonGetRequest("/api/agencies/${agencyId}/locations?eventType=APP", response)
    }


    void stubAppointmentTypes(def response) {
        this.stubJsonGetRequest("/api/reference-domains/scheduleReasons?eventType=APP", response)
    }

    void stubBookingOffenders(def response) {
        this.stubJsonPostRequest("/api/bookings/offenders", response)
    }

    void stubOffenderDetails(offenderNo, response) {
        this.stubFor(
                get("/api/bookings/offenderNo/${offenderNo}?fullInfo=false")
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

    void stubJsonGetRequest(String url, def response) {
        this.stubFor(
                get(url)
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))

                        )
        )
    }

    void stubJsonPostRequest(String url, def response) {
        this.stubFor(
                post(url)
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))

                        )
        )
    }

    void stubPostAppointments() {
        this.stubFor(
                post("/api/appointments")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
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

    void stubGetAlert(bookingId, alertId, alert) {
        this.stubFor(
                get("/api/bookings/${bookingId}/alerts/${alertId}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(alert))
                        )

        )
    }

    void stubPutAlert(bookingId, alertId) {
        this.stubFor(
                put("/api/bookings/${bookingId}/alert/${alertId}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json'))
                        )
    }


}
