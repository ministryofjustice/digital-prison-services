package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonOutput
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload

import java.util.stream.Collectors

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.equalToJson
import static com.github.tomakehurst.wiremock.client.WireMock.get
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


    void stubGetAttendanceForBookings(Caseload caseload, Set<String> bookings, String timeSlot, String date, data = attendanceForBookingsResponse) {
        this.stubFor(
                post("/attendances/${caseload.id}?date=${date}&period=${timeSlot}")
                        .withRequestBody(equalToJson(JsonOutput.toJson(bookings)))
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

    void verifyPostAttendance() {
        this.verify(postRequestedFor(urlEqualTo('/attendance')))
    }

    void verifyPutAttendance(int id) {
        this.verify(putRequestedFor(urlEqualTo("/attendance/${id}")))
    }
}
