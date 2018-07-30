package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput

class ActivityResponse {

    static activity1 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "PA",
            eventDescription: "Prison Activities",
            comment         : "The current activity",
            startTime       : "2017-10-15T17:00:00",
            endTime         : "2017-10-15T18:30:00"
    ]
    static visit1 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "VISIT",
            eventDescription: "Visits",
            comment         : "Friends",
            startTime       : "2017-10-15T18:00:00",
            endTime         : "2017-10-15T18:30:00"
    ]
    static activity2 = [
            offenderNo      : "A1234AB",
            firstName       : "EUGENE",
            lastName        : "BALOG",
            cellLocation    : "LEI-A-1-2",
            event           : "PA",
            eventDescription: "Prison Activities",
            comment         : "The current activity",
            startTime       : "2017-10-15T17:45:00",
            endTime         : "2017-10-15T18:30:00"
    ]
    static activity3 = [
            offenderNo      : "A1234AC",
            firstName       : "FRED",
            lastName        : "BAA",
            cellLocation    : "LEI-A-1-3",
            event           : "PA",
            eventDescription: "Prison Activities",
            comment         : "The current activity",
            startTime       : "2017-10-15T11:45:00",
            endTime         : "2017-10-15T13:30:00"
    ]
    static appointment1 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            comment         : "Appt details",
            event           : "MEDE",
            eventDescription: "Medical - Dentist",
            startTime       : "2018-06-18T11:40:00"
    ]
    static activities = JsonOutput.toJson([
            activity1,
            activity2,
            activity3
    ])
    static visits = JsonOutput.toJson([
            visit1
    ])
    static appointments = JsonOutput.toJson([
            appointment1
    ])

    static acrtivitiesByNameOrderDesc = JsonOutput.toJson([
        activity3,
        activity2,
        activity1
    ])
}
