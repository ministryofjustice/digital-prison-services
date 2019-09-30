package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput

class ActivityResponse {

    static activity1_1 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "PA",
            eventId         : 100,
            eventDescription: "Prison Activities",
            comment         : "Activity 1",
            startTime       : "2017-10-15T17:00:00",
            endTime         : "2017-10-15T18:30:00",
            locationId      : 2
    ]

    static activity1_2 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "PA",
            eventId         : 101,
            eventDescription: "Prison Activities",
            comment         : "Activity 2",
            startTime       : "2017-10-15T17:00:00",
            endTime         : "2017-10-15T18:30:00",
            locationId      : 2
    ]

    static activity1_3 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "PA",
            eventId         : 102,
            eventDescription: "Prison Activities",
            comment         : "Activity 3",
            startTime       : "2017-10-15T17:00:00",
            endTime         : "2017-10-15T18:30:00",
            locationId      : 2
    ]

    static visit1 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "VISIT",
            eventId         : 103,
            eventDescription: "Visits",
            comment         : "Friends",
            startTime       : "2017-10-15T18:00:00",
            endTime         : "2017-10-15T18:30:00",
            locationId      : 3
    ]
    static activity2 = [
            offenderNo      : "A1234AB",
            firstName       : "EUGENE",
            lastName        : "BALOG",
            cellLocation    : "LEI-A-1-2",
            event           : "PA",
            eventId         : 104,
            eventDescription: "Prison Activities",
            comment         : "Activity 1",
            startTime       : "2017-10-15T17:45:00",
            endTime         : "2017-10-15T18:30:00",
            locationId      : 2
    ]
    static activity3 = [
            offenderNo      : "A1234AC",
            firstName       : "FRED",
            lastName        : "BAA",
            cellLocation    : "LEI-A-1-3",
            event           : "PA",
            eventId         : 105,
            eventDescription: "Prison Activities",
            comment         : "Activity 1",
            startTime       : "2017-10-15T11:45:00",
            endTime         : "2017-10-15T13:30:00",
            locationId      : 2
    ]
    static appointment1 = [
            offenderNo      : "A1234AA",
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            comment         : "Appt details",
            event           : "MEDE",
            eventId         : 106,
            eventDescription: "Medical - Dentist",
            eventLocation:    "Medical Room1",
            startTime       : "2017-10-15T15:30:00",
            locationId      : 4
    ]
    static  activities = JsonOutput.toJson([
            activity1_1,
            activity1_2,
            activity1_3,
            activity2,
            activity3
    ])
    static  pastActivities = JsonOutput.toJson([
            activity1_1,
            activity1_2,
            activity2,
    ])
    static visits = JsonOutput.toJson([
            visit1
    ])
    static appointments = JsonOutput.toJson([
            appointment1
    ])
}
