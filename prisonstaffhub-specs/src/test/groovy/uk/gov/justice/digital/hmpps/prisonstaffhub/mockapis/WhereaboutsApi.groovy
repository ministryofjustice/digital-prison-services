package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonBuilder
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.*
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload

import java.time.format.DateTimeFormatter

import static com.github.tomakehurst.wiremock.client.WireMock.*

public class WhereaboutsApi extends WireMockRule {

    WhereaboutsApi() {
        super(18082)
    }

    def attendance = [
            {
                id: 1
                bookingId: 123
                eventId: 370398900
                eventLocationId: 26149
                period: 'PM'
                prisonId: 'MDI'
                attended: true
                paid: true
                eventDate: '2019-05-15'
            },
            {
                id: 2
                bookingId: 456
                eventId: 370405219
                eventLocationId: 26149
                period: 'PM'
                prisonId: 'MDI'
                attended: true
                paid: false
                eventDate: '2019-05-15'
            },
    ]

    def attendanceForBookingsResponse = [
            [
                attended: true,
                bookingId: 1,
                caseNoteId: 0,
                createUserId: 'string',
                eventDate: 'string',
                eventId: 10,
                eventLocationId: 100,
                id: 1,
                modifyUserId: 'string',
                paid: true,
                period: 'AM',
                prisonId: 'string',
            ],
            [
                absentReason: 'UnacceptableAbsence',
                attended: true,
                bookingId: 3,
                caseNoteId: 0,
                comments: 'Never turned up.',
                createUserId: 'string',
                eventDate: 'string',
                eventId: 20,
                eventLocationId: 200,
                id: 2,
                modifyUserId: 'string',
                paid: false,
                period: 'AM',
                prisonId: 'string',
            ],
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

    void stubGetAttendance(Caseload caseload, int locationId, String timeSlot, String date) {
        this.stubFor(
                get("/attendance/${caseload.id}/${locationId}?date=${date}&period=${timeSlot}")
                        .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader('Content-Type', 'application/json')
                        .withBody(JsonOutput.toJson(attendance))))
    }

    void stubGetAttendanceForBookings(Caseload caseload, String bookings, String timeSlot, String date) {
        this.stubFor(
                get("/attendance/${caseload.id}?${bookings}&date=${date}&period=${timeSlot}")
                        .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader('Content-Type', 'application/json')
                        .withBody(JsonOutput.toJson(attendanceForBookingsResponse))))
    }



    void stubGetAbsenceReasons() {
        this.stubFor(
                get('/attendance/absence-reasons')
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
}
