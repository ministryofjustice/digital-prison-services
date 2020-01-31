package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

class IncentiveLevelHistoryResponse {
    static response1 = [
        bookingId: -3,
        iepDate: "2017-10-12",
        iepTime: "2017-10-12T07:53:45",
        iepLevel: "Enhanced",
        daysSinceReview: 572,
        iepDetails: [
                [
                    bookingId: -3,
                    iepDate: "2017-10-12",
                    iepTime: "2017-10-12T07:53:45",
                    agencyId: "LEI",
                    iepLevel: "Enhanced",
                    comments: "Did not assault another inmate - data entry error.",
                    userId: "ITAG_USER"
                ],
                [
                    bookingId: -3,
                    iepDate: "2017-10-12",
                    iepTime: "2017-10-12T09:44:01",
                    agencyId: "LEI",
                    iepLevel: "Basic",
                    comments: "Assaulted another inmate.",
                    userId: "ITAG_USER"
                ],
                [
                    bookingId: -3,
                    iepDate: "2017-08-22",
                    iepTime: "2017-08-22T18:42:35",
                    agencyId: "LEI",
                    iepLevel: "Standard",
                    comments: "He has been a very good boy.",
                    userId: "ITAG_USER"
                ],
                [
                    bookingId: -3,
                    iepDate: "2017-07-04",
                    iepTime: "2017-07-04T12:15:42",
                    agencyId: "LEI",
                    iepLevel: "Entry",
                    comments: "Just came in.",
                    userId: "ITAG_USER"
                ]
        ]
    ]
}
