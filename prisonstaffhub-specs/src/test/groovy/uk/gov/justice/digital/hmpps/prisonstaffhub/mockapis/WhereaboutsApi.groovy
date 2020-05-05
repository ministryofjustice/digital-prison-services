package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonOutput
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor
import static com.github.tomakehurst.wiremock.client.WireMock.post
import static com.github.tomakehurst.wiremock.client.WireMock.put
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor
import static com.github.tomakehurst.wiremock.client.WireMock.putRequestedFor
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo

public class WhereaboutsApi extends WireMockRule {

    WhereaboutsApi() {
        super(18082)
    }

    def attendance = [
        attendances:[
            {
                id: 1
                bookingId: 3
                eventId: 102
                eventLocationId: 1
                period: 'PM'
                prisonId: 'LEI'
                attended: true
                paid: true
                eventDate: '2019-05-15'
            },
            {
                id: 2
                bookingId: 2
                eventId: 101
                eventLocationId: 1
                period: 'PM'
                prisonId: 'LEI'
                attended: true
                paid: false
                eventDate: '2019-05-15'
            },
            {
                id: 3
                bookingId: 1
                eventId: 100
                eventLocationId: 2
                period: 'PM'
                prisonId: 'LEI'
                attended: false
                paid: false
                absenceReasons: 'UnacceptableAbsence'
                eventDate: '2019-05-15'
            },
        ]
    ]

    def attendanceForBookingsResponse = [
        attendances: [
            [
                id: 1,
                attended: true,
                bookingId: 1,
                caseNoteId: 0,
                createUserId: 'string',
                eventDate: 'string',
                eventId: 10,
                eventLocationId: 100,
                modifyUserId: 'string',
                paid: true,
                period: 'AM',
                prisonId: 'string',
            ],
            [
                id: 2,
                absentReason: 'UnacceptableAbsence',
                attended: true,
                bookingId: 3,
                caseNoteId: 0,
                comments: 'Never turned up.',
                createUserId: 'string',
                eventDate: 'string',
                eventId: 20,
                eventLocationId: 200,
                modifyUserId: 'string',
                paid: false,
                period: 'AM',
                prisonId: 'string',
            ],
        ]
    ]

    def absenceReasons = [
            paidReasons: [ 'AcceptableAbsence', 'NotRequired' ],
            unpaidReasons:
                    [ 'Refused',
                      'RestDay',
                      'RestInCell',
                      'UnacceptableAbsence',
                      'SessionCancelled',
                      'Sick' ],
            triggersIEPWarning: [ 'Refused', 'UnacceptableAbsence' ]
    ]

    def courtLocations = [
            courtLocations: [
                    "London",
                    "Sheffield",
                    "Leeds"
            ]
    ]

    void stubGetAttendance(Caseload caseload, int locationId, String timeSlot, String date, data = attendance) {
        this.stubFor(
                get("/attendances/${caseload.id}/${locationId}?date=${date}&period=${timeSlot}")
                        .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader('Content-Type', 'application/json')
                        .withBody(JsonOutput.toJson(data))))
    }

    void stubGetAttendanceForBookings(Caseload caseload, String timeSlot, String date, data = attendanceForBookingsResponse) {
        this.stubFor(
                post("/attendances/${caseload.id}?date=${date}&period=${timeSlot}")
                        .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader('Content-Type', 'application/json')
                        .withBody(JsonOutput.toJson(data))))
    }

    void stubGetAbsenceReasons() {
        this.stubFor(
                get('/absence-reasons')
                        .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader('Content-Type', 'application/json')
                        .withBody(JsonOutput.toJson(absenceReasons))))
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

    void stubPostAttendance(attendanceToReturn = []) {
        this.stubFor(
                post('/attendance')
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(attendanceToReturn)))
        )
    }

    void stubPutAttendance(attendanceToReturn) {
        this.stubFor(
                put("/attendance/${attendanceToReturn.id}")
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(attendanceToReturn)))
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
                get("/agencies/${caseload.id}/locations/groups")
                        .willReturn(
                                aResponse()
                                        .withBody(caseload.id.equals('SYI') ? jsonSYI : json)
                                        .withHeader('Content-Type', 'application/json')
                                        .withStatus(200))
        )
    }

    void stubGetAgencyGroupLocations(agencyId, groupName) {
        this.stubFor(
                get("/locations/groups/${agencyId}/${groupName}")
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody("[1]")
                        )
        )

    }

    void stubCourtLocations() {
        this.stubFor(
                get("/court/all-courts")
                    .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader('Content-Type', 'application/json')
                        .withBody(JsonOutput.toJson(courtLocations))

                )
        )
    }

    void stubAddVideoLinkAppointment() {
        this.stubFor(
                post("/court/add-video-link-appointment")
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                )
        )
    }

    void getVideoLinkAppointments(def response) {
        this.stubFor(
                post("/court/video-link-appointments")
                        .willReturn(
                        aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(response))
                )
        )
    }

    void stubAttendanceChanges(fromDateTime, toDateTime, response) {
        this.stubFor(
                get("/attendances/changes?fromDateTime=${fromDateTime}&toDateTime=${toDateTime}")
                .willReturn(
                        aResponse()
                        .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson(response))
                )
        )
    }

    void verifyAttendanceChanges(fromDateTime, toDateTime) {
        this.verify(getRequestedFor(urlEqualTo("/attendances/changes?fromDateTime=${fromDateTime}&toDateTime=${toDateTime}")))
    }

    void stubAttendanceStats(agencyId, period, fromDate, response) {
        this.stubFor(
                get("/attendance-statistics/${agencyId}/over-date-range?fromDate=${fromDate}&toDate=${fromDate}&period=${period}")
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader('Content-Type', 'application/json')
                                        .withBody(JsonOutput.toJson(response))
                        )
        )
    }

    void verifyPostAttendance() {
        this.verify(postRequestedFor(urlEqualTo('/attendance')))
    }

    void verifyPutAttendance(int id) {
        this.verify(putRequestedFor(urlEqualTo("/attendance/${id}")))
    }
}
