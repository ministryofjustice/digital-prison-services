package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput

class HouseblockResponse {

    static response1 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "PROG",
            comment         : "Woodwork",
            eventDescription: "comment12",
            startTime       : "2017-10-15T17:00:00",
            endTime         : "2017-10-15T18:30:00"
    ];
    static response2 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "VISIT",
            comment         : "Friends",
            eventDescription: "comment14",
            startTime       : "2017-10-15T18:00:00",
            endTime         : "2017-10-15T18:30:00"
    ];
    static response3 = [
            offenderNo      : "A1234AB",
            firstName       : "EUGENE",
            lastName        : "BALOG",
            cellLocation    : "LEI-A-1-2",
            event           : "PROG",
            comment: "TV Repairs",
            eventDescription         : "comment17",
            startTime       : "2017-10-15T17:45:00",
            endTime         : "2017-10-15T18:30:00"
    ];
    static response4 = [
            offenderNo      : "A1234AC",
            firstName       : "FRED",
            lastName        : "BAA",
            cellLocation    : "LEI-A-1-3",
            event           : "CHAP",
            comment: "Chapel",
            eventDescription         : "comment18",
            startTime       : "2017-10-15T11:45:00",
            endTime         : "2017-10-15T13:30:00"
    ];
    static responseCellOrder = JsonOutput.toJson([
            response1,
            response2,
            response3,
            response4
    ])
    static responseNameOrder = JsonOutput.toJson([
            response1,
            response2,
            response4,
            response3
    ])
}
