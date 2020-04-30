package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AttendanceChangesPage

class AttendanceChangesSpecification extends BrowserReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should display attendance changes" () {
        fixture.loginAs(UserAccount.ITAG_USER)

        def fromDateTime = "2010-10-10T10:00"
        def toDateTime = "2010-10-10T17:00"
        def subHeading = "test"

        whereaboutsApi.stubAttendanceChanges(fromDateTime, toDateTime,
                [ "changes": [
                        [
                            "eventId" : 1,
                            "changedBy": "ITAG_USER",
                            "changedOn": "2010-10-10T20:00",
                            "changedFrom": "Attended",
                            "changedTo": "Refused"
                        ]
                    ]
                ]
        )

        elite2api.stubScheduledActivities("MDI", [
                [ "eventId" :1, "comment": "Houseblock 1", "firstName": "bob", "lastName": "sut", "offenderNo": "A123456"  ]
        ])

        oauthApi.stubGetUserDetails("ITAG_USER", "staff user")

        given: "I navigate to the attendance changes screen"
        go  "/attendance-changes?fromDateTime=${fromDateTime}&toDateTime=${toDateTime}&subHeading=${subHeading}"

        when: "The attendance changes screen has loaded"
        at AttendanceChangesPage

        then: "There should be changes displayed"
        assert tableRows[1].text() == 'Bob Sut A123456 Houseblock 1 Attended Refused 10 October 2010 - 20:00 staff user'
    }
}
