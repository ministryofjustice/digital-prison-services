package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonBuilder
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.ActivityResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.EstablishmentRollResponses
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.GlobalSearchResponses
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.HouseblockResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.ActivityLocationsResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount

import static com.github.tomakehurst.wiremock.client.WireMock.*

class Elite2Api extends WireMockRule {

    Elite2Api() {
        super(8080)
    }

    void stubUpdateActiveCaseload() {
        this.stubFor(
                put('/api/users/me/activeCaseLoad')
                        .willReturn(
                        aResponse()
                                .withStatus(200)
              ))
    }

    void stubGetMyDetails(UserAccount user) {
        stubGetMyDetails(user, Caseload.LEI.id)
    }

    void stubGetMyDetails(UserAccount user, String caseloadId ) {
        this.stubFor(
                get('/api/users/me')
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson([
                                staffId         : user.staffMember.id,
                                username        : user.username,
                                firstName       : user.staffMember.firstName,
                                lastName        : user.staffMember.lastName,
                                email           : 'itaguser@syscon.net',
                                activeCaseLoadId: caseloadId
                        ]))))
    }

    void stubGetMyCaseloads(List<Caseload> caseloads) {
        def json = new JsonBuilder()
        json caseloads, { caseload ->
            caseLoadId caseload.id
            description caseload.description
            type caseload.type
            caseloadFunction 'DUMMY'
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
                get('/health')
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody('''
                {
                    "status": "UP",
                    "healthInfo": {
                        "status": "UP",
                        "version": "version not available"
                    },
                    "diskSpace": {
                        "status": "UP",
                        "total": 510923390976,
                        "free": 143828922368,
                        "threshold": 10485760
                    },
                    "db": {
                        "status": "UP",
                        "database": "HSQL Database Engine",
                        "hello": 1
                    }
                }'''.stripIndent())
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

    void stubGroups(Caseload caseload) {

        def json = JsonOutput.toJson([
                [ name: '1', children: [
                        [ name: 'A'],[ name: 'B'],[ name: 'C']
                ]],
                [ name: '2', children: [
                        [ name: 'A'],[ name: 'B'],[ name: 'C']
                ]],
                [ name: '3', children: [
                        [ name: 'A'],[ name: 'B'],[ name: 'C']
                ]]])
        def jsonSYI = JsonOutput.toJson([
                [ name: 'block1', children: [
                        [ name: 'A'],[ name: 'B']
                ]],
                [ name: 'block2', children: [
                        [ name: 'A'],[ name: 'B'],[ name: 'C']
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
        stubSentenceData(offenderNumbers, date, true)
        stubCourtEvents(offenderNumbers, date)
        stubExternalTransfers(offenderNumbers, date, true)
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
        stubCourtEvents(offenderNumbers, date)
        stubExternalTransfers(offenderNumbers, date, true)
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
        stubCourtEvents(offenderNumbers, date)
        stubExternalTransfers(offenderNumbers, date)
    }

    void stubGetHouseBlockListWithAllCourtEvents(Caseload caseload, String groupName, String timeSlot, String date) {
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
        stubExternalTransfers(offenderNumbers, date, true)

        this.stubFor(
                post("/api/schedules/LEI/courtEvents?date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                        aResponse()
                                .withBody(HouseblockResponse.courtEventsWithDifferentStatuesResponse)
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200)))

    }

    void stubGetActivityList(Caseload caseload, int locationId, String timeSlot, String date) {
        this.stubFor(
                get("/api/schedules/${caseload.id}/locations/${locationId}/usage/PROG?date=${date}&timeSlot=${timeSlot}")
                        .willReturn(
                        aResponse()
                                .withBody(ActivityResponse.activities)
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200))
        )
        this.stubFor(
                get("/api/schedules/${caseload.id}/locations/${locationId}/usage/VISIT?date=${date}&timeSlot=${timeSlot}")
                        .willReturn(
                        aResponse()
                                .withBody('[]')
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200))
        )
        this.stubFor(
                get("/api/schedules/${caseload.id}/locations/${locationId}/usage/APP?date=${date}&timeSlot=${timeSlot}")
                        .willReturn(
                        aResponse()
                                .withBody('[]')
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200))
        )

        def offenderNumbers = [
            ActivityResponse.activity1_1.offenderNo,
            ActivityResponse.activity2.offenderNo,
            ActivityResponse.activity3.offenderNo
        ]

        this.stubFor(
                post("/api/schedules/${caseload.id}/visits?timeSlot=${timeSlot}&date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers)))
                        .willReturn(
                        aResponse()
                                .withBody(ActivityResponse.appointments)
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200))
        )

        this.stubFor(
                post("/api/schedules/${caseload.id}/appointments?timeSlot=${timeSlot}&date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers)))
                        .willReturn(
                        aResponse()
                                .withBody(ActivityResponse.visits)
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200))
        )

        this.stubFor(
                post("/api/schedules/${caseload.id}/activities?timeSlot=${timeSlot}&date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers)))
                        .willReturn(
                        aResponse()
                                .withBody(ActivityResponse.activities)
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200))
        )

       this.stubFor(
                post("/api/offender-sentences")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers)))
                        .willReturn(
                        aResponse()
                                .withBody(JsonOutput.toJson([[
                                    "offenderNo":   ActivityResponse.activity3.offenderNo,
                                    "sentenceDetail": ["releaseDate": date]
                                ]]))
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200))
        )
        this.stubFor(
                post("/api/schedules/LEI/courtEvents?date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                        aResponse()
                                .withBody(HouseblockResponse.courtEventsWithDifferentStatuesResponse)
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200)))
        stubExternalTransfers(offenderNumbers, date)
    }

    def stubSentenceData(List offenderNumbers, String formattedReleaseDate, Boolean emptyResponse = false) {
        def index = 0

        def response = emptyResponse ? [] : offenderNumbers.collect({no -> [
                "offenderNo": no,
                "firstName": "firstName-${index++}",
                "lastName": "lastName-${index++}",
                "sentenceDetail": ["releaseDate": formattedReleaseDate]
        ]})

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

    def stubCourtEvents(List offenderNumbers, String date) {
        this.stubFor(
                post("/api/schedules/LEI/courtEvents?date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                        aResponse()
                                .withBody(HouseblockResponse.courtEventsResponse)
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200)))
    }

    def stubExternalTransfers(List offenderNumbers, String date, Boolean emptyResponse = false) {
        def json = emptyResponse ? JsonOutput.toJson([]) : HouseblockResponse.externalTransfersResponse

        this.stubFor(
                post("/api/schedules/LEI/externalTransfers?date=${date}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(offenderNumbers), true, false))
                        .willReturn(
                        aResponse()
                                .withBody(json)
                                .withHeader('Content-Type', 'application/json')
                                .withStatus(200)))
    }

    def stubGlobalSearch(offenderNo, lastName, firstName, response) {
        final totalRecords = String.valueOf(response.size())

        this.stubFor(
                get("/api/prisoners?offenderNo=${offenderNo}&lastName=${lastName}&firstName=${firstName}&partialNameMatch=false&includeAliases=true")
                        .withHeader('page-offset', equalTo('0'))
                        .withHeader('page-limit', equalTo('10'))
                        .willReturn(
                        aResponse()
                                .withBody(JsonOutput.toJson(response[0..Math.min(9, response.size() - 1)]))
                                .withHeader('Content-Type', 'application/json')
                                .withHeader('total-records', totalRecords)
                                .withHeader('page-limit', '10')
                                .withHeader('page-offset', '0')
                                .withStatus(200)))
        if (response.size() > 10) {
            this.stubFor(
                    get("/api/prisoners?offenderNo=${offenderNo}&lastName=${lastName}&firstName=${firstName}&partialNameMatch=false&includeAliases=true")
                            .withHeader('page-offset', equalTo('10'))
                            .withHeader('page-limit', equalTo('10'))
                            .willReturn(
                            aResponse()
                                    .withBody(JsonOutput.toJson(response[10..11]))
                                    .withHeader('Content-Type', 'application/json')
                                    .withHeader('total-records', totalRecords)
                                    .withHeader('page-limit', '10')
                                    .withHeader('page-offset', '10')
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
    }

    void stubImage() {
        this.stubFor(
                get(urlMatching("/api/bookings/offenderNo/.+/image/data"))
                        .willReturn(aResponse()
                        .withStatus(404)))
    }

    static def extractOffenderNumbers(String json) {
        return (new JsonSlurper().parseText(json) as ArrayList)
                .collect({a -> a.offenderNo})
                .unique()
                .toList()
    }
}
