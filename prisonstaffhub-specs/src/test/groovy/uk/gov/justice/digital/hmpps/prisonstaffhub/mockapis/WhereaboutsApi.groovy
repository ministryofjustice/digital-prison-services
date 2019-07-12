package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis

import com.github.tomakehurst.wiremock.junit.WireMockRule
import groovy.json.JsonOutput
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get

public class WhereaboutsApi extends WireMockRule  {

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

    void stubGetAttendance(Caseload caseload, int locationId, String timeSlot, String date) {
        this.stubFor(
                get("/attendance/${caseload.id}/${locationId}?date=${date}&period=${timeSlot}")
                        .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader('Content-Type', 'application/json')
                        .withBody(JsonOutput.toJson(attendance))))
    }

    void stubAbsentReasons() {
        this.stubFor(
                get("/attendance/absence-reasons")
                        .willReturn(aResponse()
                                .withStatus(200)
                                .withHeader('Content-Type', 'application/json')
                                .withBody(JsonOutput.toJson([
                                        paidReasons: [],
                                        unpaidReasons: [],
                                        triggersIEPWarnings: []
                                ]))))
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
