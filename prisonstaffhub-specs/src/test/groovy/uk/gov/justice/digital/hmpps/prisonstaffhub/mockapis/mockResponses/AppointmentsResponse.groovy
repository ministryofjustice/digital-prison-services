package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses
import groovy.json.JsonOutput

class AppointmentsResponse {
    static appointment1 = [
            offenderNo      : "A12345",
            firstName       : "TEST",
            lastName        : "USER",
            cellLocation    : "LEI-A-1-1",
            comment         : "Appt details",
            event           : "MEDE",
            eventId         : 106,
            eventDescription: "Medical - Dentist",
            eventLocation   : "Medical Room1",
            startTime       : "2017-10-15T15:30:00",
            locationId      : 4
    ]

    static appointments = JsonOutput.toJson([
            appointment1
    ])
}

