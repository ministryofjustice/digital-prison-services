package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonBuilder
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.ActivityResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.HouseblockResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.ActivityLocationsResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount

import static com.github.tomakehurst.wiremock.client.WireMock.*

class Elite2Api extends WireMockRule {

    Elite2Api() {
        super(8080)
    }

    void stubValidOAuthTokenRequest(UserAccount user, Boolean delayOAuthResponse = false) {

        final accessToken = JwtFactory.token()

        final response = aResponse()
                .withStatus(200)
                .withHeader('Content-Type', 'application/json;charset=UTF-8')
                .withBody(JsonOutput.toJson([
                access_token : accessToken,
                token_type   : 'bearer',
                refresh_token: JwtFactory.token(),
                expires_in   : 599,
                scope        : 'read write',
                internalUser : true
        ]))

        if (delayOAuthResponse) {
            response.withFixedDelay(5000)
        }

        stubFor(
                post('/oauth/token')
                        .withHeader('authorization', equalTo('Basic ZWxpdGUyYXBpY2xpZW50OmNsaWVudHNlY3JldA=='))
                        .withHeader('Content-Type', equalTo('application/x-www-form-urlencoded'))
                        .withRequestBody(equalTo("username=${user.username}&password=password&grant_type=password"))
                        .willReturn(response))
    }

    void stubInvalidOAuthTokenRequest(UserAccount user, boolean badPassword = false) {
        stubFor(
                post('/oauth/token')
                        .withHeader('authorization', equalTo('Basic ZWxpdGUyYXBpY2xpZW50OmNsaWVudHNlY3JldA=='))
                        .withHeader('Content-Type', equalTo('application/x-www-form-urlencoded'))
                        .withRequestBody(matching("username=${user.username}&password=.*&grant_type=password"))
                        .willReturn(
                        aResponse()
                                .withStatus(400)
                                .withBody(JsonOutput.toJson([
                                error            : 'invalid_grant',
                                error_description:
                                        badPassword ?
                                                "invalid authorization specification - not found: ${user.username}"
                                                :
                                                "invalid authorization specification"
                        ]))))
    }

    void stubUpdateActiveCaseload() {
        stubFor(
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
        stubFor(
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

        stubFor(
                get('/api/users/me/caseLoads')
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(json.toString())
                ))
    }

    void stubHealth() {
        stubFor(
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
                ]]]);
        def jsonSYI = JsonOutput.toJson([
                [ name: 'block1', children: [
                        [ name: 'A'],[ name: 'B']
                ]],
                [ name: 'block2', children: [
                        [ name: 'A'],[ name: 'B'],[ name: 'C']
                ]]]);

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
        stubCourtEvents(offenderNumbers, date)
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

    static def extractOffenderNumbers(String json) {
        return (new JsonSlurper().parseText(json) as ArrayList)
                .collect({a -> a.offenderNo})
                .unique()
                .toList()
    }
}
