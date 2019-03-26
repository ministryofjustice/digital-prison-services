package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

class GlobalSearchResponses {
    static response1 = [
            [
                    offenderNo    : "A1234AC",
                    firstName     : "FRED",
                    lastName      : "QUIMBY",
                    latestLocation: "Leeds HMP",
                    dateOfBirth   : "1977-10-15",
                    currentWorkingLastName : "QUIMBY",
                    currentWorkingFirstName : "FRED",
                    latestLocationId: "LEI",
            ], [
                    offenderNo    : "A1234AA",
                    firstName     : "ARTHUR",
                    lastName      : "QUIMBY",
                    latestLocation: "Moorland HMP",
                    dateOfBirth   : "1976-09-15",
                    currentWorkingLastName : "QUIMBY",
                    currentWorkingFirstName : "ARTHUR",
                    latestLocationId: "MDI",
            ]
    ]

    static response2 = [
            [offenderNo: "T1001AA", firstName: "FRED1", lastName: "COMMON", "latestLocationId": "OUT", latestLocation: "Outside", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED1"],
            [offenderNo: "T1002AA", firstName: "FRED2", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED2"],
            [offenderNo: "T1003AA", firstName: "FRED3", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED3"],
            [offenderNo: "T1004AA", firstName: "FRED4", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED4"],
            [offenderNo: "T1005AA", firstName: "FRED5", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED5"],
            [offenderNo: "T1006AA", firstName: "FRED6", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED6"],
            [offenderNo: "T1007AA", firstName: "FRED7", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED7"],
            [offenderNo: "T1008AA", firstName: "FRED8", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED8"],
            [offenderNo: "T1009AA", firstName: "FRED9", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED9"],
            [offenderNo: "T1010AA", firstName: "FRED10", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED10"],
            [offenderNo: "T1011AA", firstName: "FRED11", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED11"],
            [offenderNo: "T1012AA", firstName: "FRED12", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED12"],
            [offenderNo: "T1013AA", firstName: "FRED13", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED13"],
            [offenderNo: "T1014AA", firstName: "FRED14", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED14"],
            [offenderNo: "T1015AA", firstName: "FRED15", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED15"],
            [offenderNo: "T1016AA", firstName: "FRED16", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED16"],
            [offenderNo: "T1017AA", firstName: "FRED17", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED17"],
            [offenderNo: "T1018AA", firstName: "FRED18", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED18"],
            [offenderNo: "T1019AA", firstName: "FRED19", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED19"],
            [offenderNo: "T1020AA", firstName: "FRED20", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED20"],
            [offenderNo: "T1021AA", firstName: "FRED21", lastName: "COMMON", "latestLocationId": "LEI", latestLocation: "Leeds HMP", dateOfBirth: "1977-10-15", currentWorkingLastName : "COMMON", currentWorkingFirstName : "FRED21"]
    ]

    static lastPrisonResponse = [[
                "offenderNo": "T1001AA",
                "createDateTime": "2016-05-04T09:24:46.254162",
                "fromAgency": "LNI",
                "fromAgencyDescription": "Low Newton (HMP)",
                "toAgency": "OUT",
                "toAgencyDescription": "Outside",
                "movementType": "REL",
                "movementTypeDescription": "Release",
                "directionCode": "OUT"
            ]
    ]
}
