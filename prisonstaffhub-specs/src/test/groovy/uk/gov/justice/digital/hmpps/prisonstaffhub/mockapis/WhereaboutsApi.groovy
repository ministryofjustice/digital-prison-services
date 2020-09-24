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
}
