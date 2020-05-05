package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AttendanceChangesPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AttendanceStatsDashboardPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class AttendanceStatsDashboardSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should work with no stats"() {
        fixture.loginAs(UserAccount.ITAG_USER)
        def fromDateTime = "2019-10-10T00:00"
        def toDateTime = "2019-10-10T11:59"
        def agencyId = "MDI"
        def period = "AM"
        def fromDate = "10/10/2019"

        def stats = [
                   "notRecorded": 0,
                   "paidReasons": [
                           "acceptableAbsence": 0,
                           "approvedCourse": 0,
                           "attended": 0,
                           "notRequired": 0
                   ],
                   "scheduleActivities": 0,
                   "suspended": 0,
                   "unpaidReasons": [
                       "refused": 0,
                       "refusedIncentiveLevelWarning": 0,
                       "restDay": 0,
                       "restInCellOrSick": 0,
                       "sessionCancelled": 0,
                       "unacceptableAbsence": 0
                   ]
                ]
        oauthApi.stubGetMyRoles()
        oauthApi.stubGetUserDetails("ITAG_USER", "staff")
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        whereaboutsApi.stubAttendanceStats(agencyId,period, "2019-10-10", stats)
        whereaboutsApi.stubAttendanceChanges(fromDateTime, toDateTime, [changes:[]])
        whereaboutsApi.stubGetAbsenceReasons()

        given: "I navigate to the dashboard page"
        go "/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}"
        at AttendanceStatsDashboardPage

        when: "I am on the dashboard page"
        at AttendanceStatsDashboardPage

        then:
        assert changes.text() == '0'
        assert unaccountedfor.text() == '0'
        assert suspended.text() == '0'
        assert attended.text() == '0'
        assert acceptableAbsence.text() == '0'
        assert approvedCourse.text() == '0'
        assert refusedWithWarning.text() == '0'
        assert restDay.text() == '0'
        assert restInCellOrSick.text() == '0'
        assert sessionCancelled.text() == '0'
        assert unacceptableAbsenceWithWarning.text() == '0'

    }

    def "should display stats correctly"() {
        fixture.loginAs(UserAccount.ITAG_USER)
        def fromDateTime = "2019-10-10T00:00"
        def toDateTime = "2019-10-10T11:59"
        def agencyId = "MDI"
        def period = "AM"
        def fromDate = "10/10/2019"

        def stats = [
                "notRecorded": 1,
                "paidReasons": [
                        "acceptableAbsence": 1,
                        "approvedCourse": 1,
                        "attended": 1,
                        "notRequired": 1
                ],
                "scheduleActivities": 1,
                "suspended": 1,
                "unpaidReasons": [
                        "refused": 1,
                        "refusedIncentiveLevelWarning": 1,
                        "restDay": 1,
                        "restInCellOrSick": 1,
                        "sessionCancelled": 1,
                        "unacceptableAbsence": 1
                ]
        ]

        def changesResponse = [ "changes": [[
                        "eventId" : 1,
                        "changedBy": "ITAG_USER",
                        "changedOn": "2010-10-10T20:00",
                        "changedFrom": "Attended",
                        "changedTo": "Refused"
                ]]
        ]

        oauthApi.stubGetMyRoles()
        oauthApi.stubGetUserDetails("ITAG_USER", "staff")
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        whereaboutsApi.stubAttendanceStats(agencyId,period, "2019-10-10", stats)
        whereaboutsApi.stubAttendanceChanges(fromDateTime, toDateTime, changesResponse)
        whereaboutsApi.stubGetAbsenceReasons()

        given: "I navigate to the dashboard page"
        go "/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}"
        at AttendanceStatsDashboardPage

        when: "I am on the dashboard page"
        at AttendanceStatsDashboardPage

        then:
        assert changes.text() == '1'
        assert unaccountedfor.text() == '1'
        assert suspended.text() == '1'
        assert attended.text() == '1'
        assert acceptableAbsence.text() == '1'
        assert approvedCourse.text() == '1'
        assert refusedWithWarning.text() == '1'
        assert restDay.text() == '1'
        assert restInCellOrSick.text() == '1'
        assert sessionCancelled.text() == '1'
        assert unacceptableAbsenceWithWarning.text() == '1'
    }

    def "clicking the change count should take you to the changes screen"() {
        fixture.loginAs(UserAccount.ITAG_USER)
        def fromDateTime = "2019-10-10T00:00"
        def toDateTime = "2019-10-10T11:59"
        def agencyId = "MDI"
        def period = "AM"
        def fromDate = "10/10/2019"

        def stats = [
                "notRecorded": 1,
                "paidReasons": [
                        "acceptableAbsence": 1,
                        "approvedCourse": 1,
                        "attended": 1,
                        "notRequired": 1
                ],
                "scheduleActivities": 1,
                "suspended": 1,
                "unpaidReasons": [
                        "refused": 1,
                        "refusedIncentiveLevelWarning": 1,
                        "restDay": 1,
                        "restInCellOrSick": 1,
                        "sessionCancelled": 1,
                        "unacceptableAbsence": 1
                ]
        ]

        def changesResponse = [ "changes": [[
                                                    "eventId" : 1,
                                                    "changedBy": "ITAG_USER",
                                                    "changedOn": "2010-10-10T20:00",
                                                    "changedFrom": "Attended",
                                                    "changedTo": "Refused"
                                            ]]
        ]

        elite2api.stubScheduledActivities("MDI", [
                [ "eventId" :1, "comment": "Houseblock 1", "firstName": "bob", "lastName": "sut", "offenderNo": "A123456"  ]
        ])
        oauthApi.stubGetMyRoles()
        oauthApi.stubGetUserDetails("ITAG_USER", "staff")
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        whereaboutsApi.stubAttendanceStats(agencyId,period, "2019-10-10", stats)
        whereaboutsApi.stubAttendanceChanges(fromDateTime, toDateTime, changesResponse)
        whereaboutsApi.stubGetAbsenceReasons()

        given: "I navigate to the dashboard page"
        go "/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}"
        at AttendanceStatsDashboardPage

        when: "I am on the dashboard page"
        at AttendanceStatsDashboardPage

        and: "I click the changes count link"
        changes.click()

        and: "I should be on the attendance changes page"
        at AttendanceChangesPage

        then: "A attendance changes request has been made with the correct parameters"
        whereaboutsApi.verifyAttendanceChanges(fromDateTime, toDateTime)
    }

}
