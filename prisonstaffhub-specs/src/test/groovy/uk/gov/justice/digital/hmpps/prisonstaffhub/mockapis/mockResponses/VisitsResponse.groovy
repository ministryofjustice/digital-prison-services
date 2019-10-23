package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput

class VisitsResponse {
    static visit1 = [
            offenderNo      : "A12345",
            firstName       : "TEST",
            lastName        : "USER",
            cellLocation    : "LEI-A-1-1",
            event           : "VISIT",
            eventId         : 103,
            eventLocation   : "Visiting room",
            eventDescription: "Visits",
            comment         : "Friends",
            startTime       : "2017-10-15T18:00:00",
            endTime         : "2017-10-15T18:30:00",
            locationId      : 3
    ]

    static visits = JsonOutput.toJson([
            visit1
    ])
}
