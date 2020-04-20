package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ViewAppointmentsPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class ViewAppointmentsSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should display no results"() {
        setupTests()

        elite2api.stubGetAppointmentsForAgency(UserAccount.ITAG_USER.workingCaseload.id, [])
        whereaboutsApi.getVideoLinkAppointments([])

        when: "I navigate to the view appointments page"
        to ViewAppointmentsPage

        then: "I should be told that there are no results to display"
        noResultsMessage.displayed
    }

    def "should display correct results"() {
        setupTestsWithData()

        when: "I navigate to the view appointments page"
        to ViewAppointmentsPage

        then: "I should be presented with the correct results"
        searchResultsTableRows[1].text() == '12:30 One, Offender ABC123 Medical - Other HEALTH CARE Staff One'
        searchResultsTableRows[2].text() == '13:30 to 14:30 Two, Offender ABC456 Gym - Exercise GYM Staff Two'
        searchResultsTableRows[3].text() == '14:30 to 15:30 Three, Offender ABC789 Video Link booking VCC ROOM\nwith: Wimbledon Court Name (court)'
    }

    def "should filter by appointment type"() {
        setupTestsWithData()

        when: "I navigate to the view appointments page"
        to ViewAppointmentsPage

        and: "I select Video link booking and update results"
        form.type = 'VLB'
        submitButton.click()

        then: "I should be presented with correct results"
        at ViewAppointmentsPage
        searchResultsTableRows.size() == 2
        searchResultsTableRows[1].text() == '14:30 to 15:30 Three, Offender ABC789 Video Link booking VCC ROOM\nwith: Wimbledon Court Name (court)'
    }

    def "should display court name for video link appointments created on behalf of the courts"() {
        setupTests()
        elite2api.stubGetAppointmentsForAgency(UserAccount.ITAG_USER.workingCaseload.id, [
                [
                        id                        : 1,
                        offenderNo                : 'ABC123',
                        firstName                 : 'OFFENDER',
                        lastName                  : 'ONE',
                        date                      : '2020-01-02',
                        startTime                 : '2020-01-02T12:30:00',
                        appointmentTypeDescription: 'Medical - Other',
                        appointmentTypeCode       : 'MEOT',
                        locationDescription       : 'HEALTH CARE',
                        locationId                : 123,
                        createUserId              : 'STAFF_1',
                        agencyId                  : 'MDI'
                ]]
        )
        elite2api.stubUserDetails('STAFF_1', [
                firstName: "Staff",
                lastName : "One"
        ])
        whereaboutsApi.getVideoLinkAppointments([
                appointments: [[
                                       id               : 1,
                                       bookingId        : 1,
                                       appointmentId    : 3,
                                       court            : 'Wimbledon',
                                       hearingType      : 'MAIN',
                                       madeByTheCourt   : false,
                                       createdByUsername: 'STAFF_1'
                               ]]]
        )

        when: "I navigate to the view appointments page"
        to ViewAppointmentsPage

        then: "I should be presented with the correct results"
        searchResultsTableRows[1].text() == '12:30 One, Offender ABC123 Medical - Other HEALTH CARE Staff One'
    }

    def setupTests() {
        fixture.loginAs(ITAG_USER)
        oauthApi.stubCustomUserDetails("username1", ["name": "Bob Doe"])
        elite2api.stubAppointmentTypes([Map.of("code", "ACTI", "description", "Activities"), Map.of("code", "VLB", "description", "Video link booking")],)
        elite2api.stubAppointmentLocations(
                UserAccount.ITAG_USER.workingCaseload.id,
                [Map.of("locationId", 1,
                        "locationType", "VLB",
                        "description", "VLB Room 1",
                        "userDescription", "VLB Room 1",
                        "agencyId", "LEI",
                        "createdByUsername", "username1",

                ),
                 Map.of("locationId", 2,
                         "locationType", "GYM",
                         "description", "Gym",
                         "userDescription", "Gym",
                         "agencyId", "LEI"
                 )])
    }

    def setupTestsWithData() {
        setupTests()

        elite2api.stubGetAppointmentsForAgency(UserAccount.ITAG_USER.workingCaseload.id, [
                [
                        id                        : 1,
                        offenderNo                : 'ABC123',
                        firstName                 : 'OFFENDER',
                        lastName                  : 'ONE',
                        date                      : '2020-01-02',
                        startTime                 : '2020-01-02T12:30:00',
                        appointmentTypeDescription: 'Medical - Other',
                        appointmentTypeCode       : 'MEOT',
                        locationDescription       : 'HEALTH CARE',
                        locationId                : 123,
                        createUserId              : 'STAFF_1',
                        agencyId                  : 'MDI'
                ],
                [
                        id                        : 2,
                        offenderNo                : 'ABC456',
                        firstName                 : 'OFFENDER',
                        lastName                  : 'TWO',
                        date                      : '2020-01-02',
                        startTime                 : '2020-01-02T13:30:00',
                        endTime                   : '2020-01-02T14:30:00',
                        appointmentTypeDescription: 'Gym - Exercise',
                        appointmentTypeCode       : 'GYM',
                        locationDescription       : 'GYM',
                        locationId                : 456,
                        createUserId              : 'STAFF_2',
                        agencyId                  : 'MDI',
                ],
                [
                        id                        : 3,
                        offenderNo                : 'ABC789',
                        firstName                 : 'OFFENDER',
                        lastName                  : 'THREE',
                        date                      : '2020-01-02',
                        startTime                 : '2020-01-02T14:30:00',
                        endTime                   : '2020-01-02T15:30:00',
                        appointmentTypeDescription: 'Video Link booking',
                        appointmentTypeCode       : 'VLB',
                        locationDescription       : 'VCC ROOM',
                        locationId                : 789,
                        createUserId              : 'API_PROXY_USER',
                        agencyId                  : 'MDI',
                ],
        ])
        elite2api.stubUserDetails('STAFF_1', [
                firstName: "Staff",
                lastName : "One"
        ])
        elite2api.stubUserDetails('STAFF_2', [
                firstName: "Staff",
                lastName : "Two"
        ])
        oauthApi.stubCustomUserDetails('COURT_USER', [
                name: "Court Name",
        ])
        whereaboutsApi.getVideoLinkAppointments([
                appointments: [
                        [
                                id               : 1,
                                bookingId        : 1,
                                appointmentId    : 3,
                                court            : 'Wimbledon',
                                hearingType      : 'MAIN',
                                madeByTheCourt   : true,
                                createdByUsername: 'COURT_USER'
                        ]
                ]
        ])
    }
}
