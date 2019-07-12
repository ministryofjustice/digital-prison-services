package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput

import java.text.SimpleDateFormat

class HouseblockResponse {

    static response1 = [
            offenderNo      : "A1234AA",
            bookingId       : 1,
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "PA",
            eventType       : "PRISON_ACT",
            eventDescription: "Prison Activities",
            eventId         : 10,
            eventLocationId : 100,
            comment         : "Woodwork",
            startTime       : "2017-10-15T17:00:00",
            payRate         : 1.30,
            endTime         : "2017-10-15T18:30:00"
    ]
    static response2 = [
            offenderNo      : "A1234AA",
            bookingId       : 2,
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "VISIT",
            eventType       : "VISIT",
            eventDescription: "Visits",
            comment         : "Friends",
            startTime       : "2017-10-15T18:00:00",
            endTime         : "2017-10-15T18:30:00"
    ]
    static response2_2 = [
            offenderNo      : "A1234AA",
            bookingId       : 2,
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "VISIT",
            eventType       : "VISIT",
            eventStatus     : "CANC",
            eventDescription: "Visits",
            comment         : "Friends",
            startTime       : "2017-10-15T18:30:00",
            endTime         : "2017-10-15T18:45:00"
    ]
    static response3 = [
            offenderNo      : "A1234AB",
            bookingId       : 3,
            firstName       : "EUGENE",
            lastName        : "BALOG",
            cellLocation    : "LEI-A-1-2",
            event           : "PA",
            eventDescription: "Prison Activities",
            eventType       : "PRISON_ACT",
            eventId         : 20,
            eventLocationId : 200,
            comment         : "TV Repairs",
            startTime       : "2017-10-15T17:45:00",
            endTime         : "2017-10-15T18:30:00"
    ]
    static response4 = [
            offenderNo      : "A1234AC",
            bookingId       : 4,
            firstName       : "FRED",
            lastName        : "BAA",
            cellLocation    : "LEI-A-1-3",
            event           : "PA",
            eventDescription: "Prison Activities",
            eventType       : "PRISON_ACT",
            eventId         : 40,
            eventLocationId : 400,
            comment         : "Chapel",
            startTime       : "2017-10-15T11:45:00",
            endTime         : "2017-10-15T13:30:00"
    ]
    static response5 = [
            offenderNo      : "A1234AA",
            bookingId       : 5,
            firstName       : "ARTHUR",
            lastName        : "ANDERSON",
            cellLocation    : "LEI-A-1-1",
            event           : "PA",
            eventType       : "PRISON_ACT",
            eventDescription: "reading",
            comment         : "conflict activity",
            startTime       : "2017-10-15T16:50:00",
            endTime         : "2017-10-15T18:30:00"
    ]
    static response6 = [
            offenderNo      : "A1234AH",
            bookingId       : 6,
            firstName       : "JOHN",
            lastName        : "JAMES",
            cellLocation    : "LEI-A-1-12",
            event           : "D",
            eventType       : "APP",
            eventDescription: "docs",
            comment         : "non paid act 1",
            startTime       : "2017-10-15T17:10:00",
            endTime         : "2017-10-15T18:30:00"
    ]
    static response7 = [
            offenderNo      : "A1234AH",
            bookingId       : 7,
            firstName       : "JOHN",
            lastName        : "JAMES",
            cellLocation    : "LEI-A-1-12",
            event           : "HC",
            eventType       : "APP",
            eventDescription: "hair cut",
            comment         : "non paid act 2",
            startTime       : "2017-10-15T19:10:00",
            endTime         : "2017-10-15T20:30:00"
    ]

    static response8 = [
            offenderNo      : "A1234AA",
            bookingId       : 8,
            firstName       : "JOHN",
            lastName        : "JAMES",
            cellLocation    : "LEI-A-1-12",
            event           : "HC",
            eventType       : "APP",
            eventDescription: "hair cut",
            eventLocation   : "room 1",
            comment         : "crew cut",
            startTime       : "2017-10-15T19:10:00",
            endTime         : "2017-10-15T20:30:00"
    ]


    static externalTransfer1 = [
            eventDescription: "Transfer to high security prison",
            eventStatus     : "SCH",
            eventType       : "COURT",
            firstName       : "EAMONN",
            lastName        : "ANDREWS",
            offenderNo      : "A1234AA",
            startTime       : getNow()
    ]

    static externalTransfer2 = [
            eventDescription: "Transfer to high security prison",
            eventStatus     : "COMP",
            eventType       : "COURT",
            firstName       : "EAMONN",
            lastName        : "ANDREWS",
            offenderNo      : "A1234AA",
            startTime       : getNow()
    ]

    static externalTransfer3 = [
            eventDescription: "Transfer to high security prison",
            eventStatus     : "CANC",
            eventType       : "COURT",
            firstName       : "EAMONN",
            lastName        : "ANDREWS",
            offenderNo      : "A1234AA",
            startTime       : getNow()
    ]

    static externalTransfer4 = [
            eventDescription: "Transfer to high security prison",
            eventStatus     : "EXP",
            eventType       : "COURT",
            firstName       : "EAMONN",
            lastName        : "ANDREWS",
            offenderNo      : "A1234AA",
            startTime       : getNow()
    ]


    static courtEvent1 = [
            event           : "19",
            eventDescription: "Court Appearance - Police Product Order",
            eventId         : 349360018,
            eventStatus     : "SCH",
            eventType       : "COURT",
            firstName       : "EAMONN",
            lastName        : "ANDREWS",
            offenderNo      : "A1234AA",
            startTime       : "2018-09-05T15:00:00"
    ]

    static courtEvent2 = [
            event           : "19",
            eventDescription: "Court Appearance - Police Product Order",
            eventId         : 349360018,
            eventStatus     : "COMP",
            eventType       : "COURT",
            firstName       : "EAMONN",
            lastName        : "ANDREWS",
            offenderNo      : "A1234AA",
            startTime       : "2018-09-05T15:00:00"
    ]

    static courtEvent3 = [
            event           : "19",
            eventDescription: "Court Appearance - Police Product Order",
            eventId         : 349360018,
            eventStatus     : "EXP",
            eventType       : "COURT",
            firstName       : "EAMONN",
            lastName        : "ANDREWS",
            offenderNo      : "A1234AA",
            startTime       : "2018-09-05T15:00:00"
    ]

    static responseCellOrder = JsonOutput.toJson([
            response1,
            response2,
            response2_2,
            response3,
            response4,
            response8
    ])
    static responseNameOrder = JsonOutput.toJson([
            response1,
            response2,
            response2_2,
            response4,
            response3,
            response8
    ])
    static responseMultipleActivities = JsonOutput.toJson([
            response1,
            response5
    ])
    static responseNoActivities = JsonOutput.toJson([
            response6,
            response7,
            response1,
            response2,
            response2_2,
            response3,
            response4
    ])
    static courtEventsResponse = JsonOutput.toJson([
            courtEvent1,
    ])

    static courtEventsWithDifferentStatuesResponse = JsonOutput.toJson([
            courtEvent1,
            courtEvent2,
            courtEvent3
    ])

    static externalTransfersResponse = JsonOutput.toJson([
            externalTransfer1,
            externalTransfer2,
            externalTransfer3,
            externalTransfer4
    ])

    static alertsResponse = JsonOutput.toJson([
            [
                    alertId             : 42,
                    bookingId           : 1234,
                    offenderNo          : 'A1234AA',
                    alertType           : 'H',
                    alertTypeDescription: 'Self Harm',
                    alertCode           : 'HA',
                    alertCodeDescription: 'ACCT Open (HMPS)',
                    comment             : 'qePqeP',
                    dateCreated         : '2016-07-27',
                    expired             : false,
                    active              : true,
            ],
            [
                    alertId             : 8,
                    bookingId           : 1234,
                    offenderNo          : 'A1234AA',
                    alertType           : 'X',
                    alertTypeDescription: 'Security',
                    alertCode           : 'XEL',
                    alertCodeDescription: 'Escape List',
                    dateCreated         : '2015-02-16',
                    expired             : false,
                    active              : true,
            ],
            [
                    alertId             : 2,
                    bookingId           : 1234,
                    offenderNo          : 'A1234AA',
                    alertType           : 'X',
                    alertTypeDescription: 'Security',
                    alertCode           : 'XEL',
                    alertCodeDescription: 'Escape List',
                    comment             : 'THIS ALERT HAS EXPIRED SO IS IGNORED',
                    dateCreated         : '2015-02-16',
                    dateExpires         : '2015-04-04',
                    expired             : true,
                    active              : false,
            ],
    ])

    static assessmentsResponse = JsonOutput.toJson([
            [
                    bookingId            : -1,
                    offenderNo           : 'A1234AA',
                    classificationCode   : 'A',
                    classification       : 'Cat A',
                    assessmentCode       : 'CATEGORY',
                    assessmentDescription: 'Categorisation',
                    cellSharingAlertFlag : false,
                    assessmentDate       : '2016-12-27',
                    nextReviewDate       : '2017-06-25',
            ],
            [
                    bookingId            : -2,
                    offenderNo           : 'A1234AB',
                    classificationCode   : 'H',
                    classification       : 'Cat A High',
                    assessmentCode       : 'CATEGORY',
                    assessmentDescription: 'Categorisation',
                    cellSharingAlertFlag : false,
                    assessmentDate       : '2016-12-27',
                    nextReviewDate       : '2017-06-25',
            ],
            [
                    bookingId            : -3,
                    offenderNo           : 'A1234AC',
                    classificationCode   : 'P',
                    classification       : 'Cat A Prov',
                    assessmentCode       : 'CATEGORY',
                    assessmentDescription: 'Categorisation',
                    cellSharingAlertFlag : false,
                    assessmentDate       : '2016-12-27',
                    nextReviewDate       : '2017-06-25',
            ],
            [
                    bookingId            : 466,
                    offenderNo           : 'ABCDEEE',
                    classificationCode   : 'C',
                    classification       : 'Cat C',
                    assessmentCode       : 'CATEGORY',
                    assessmentDescription: 'Categorisation',
                    cellSharingAlertFlag : false,
                    assessmentDate       : '2016-12-27',
                    nextReviewDate       : '2017-06-25',
            ],
    ])

    private static String getNow() {
        String pattern = "YYYY-MM-dd"
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern)
        simpleDateFormat.format(new Date())
    }
}
