package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ViewCourtBookingsPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class ViewCourtBookingsSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should display no results"() {
        setupTests()

        elite2api.stubGetAppointmentsForAgency("WWI", [])
        whereaboutsApi.getVideoLinkAppointments([])

        when: "I navigate to the view bookings list page"
        to ViewCourtBookingsPage

        then: "I should be told that there are no results to display"
        noResultsMessage.displayed
    }

    def "should display correct results"() {
        setupTestsWithData()

        when: "I navigate to the view appointments page"
        to ViewCourtBookingsPage

        then: "I should be presented with the correct results"
        searchResultsTableRows[1].text() == '14:30 to 15:30 Offender Three VCC ROOM Leeds'
        searchResultsTableRows[2].text() == '15:30 to 16:30 Offender Four VCC ROOM A Different Court'
    }

    def "should filter by court"() {
        setupTestsWithData()

        when: "I navigate to the view appointments page"
        to ViewCourtBookingsPage

        and: "I select Leeds and update results"
        form.courtOption = 'Leeds'
        submitButton.click()

        then: "I should be presented with correct results"
        at ViewCourtBookingsPage
        searchResultsTableRows.size() == 2
        searchResultsTableRows[1].text() == '14:30 to 15:30 Offender Three VCC ROOM Leeds'
    }

    def "should return unsupported courts when Other is selected"() {
        setupTestsWithData()

        when: "I navigate to the view appointments page"
        to ViewCourtBookingsPage

        and: "I select Other and update results"
        form.courtOption = 'Other'
        submitButton.click()

        then: "I should be presented with correct results"
        at ViewCourtBookingsPage
        searchResultsTableRows.size() == 2
        searchResultsTableRows[1].text() == '15:30 to 16:30 Offender Four VCC ROOM A Different Court'
    }

    def setupTests() {
        fixture.loginAs(ITAG_USER)
        oauthApi.stubCustomUserDetails("username1", ["name": "Bob Doe"])
        whereaboutsApi.stubCourtLocations()
    }

    def setupTestsWithData() {
        setupTests()

        elite2api.stubGetAppointmentsForAgency("WWI", [
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
                        agencyId                  : 'WWI'
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
                        agencyId                  : 'WWI',
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
                        agencyId                  : 'WWI',
                ],
                [
                        id                        : 4,
                        offenderNo                : 'ABC789',
                        firstName                 : 'OFFENDER',
                        lastName                  : 'FOUR',
                        date                      : '2020-01-02',
                        startTime                 : '2020-01-02T15:30:00',
                        endTime                   : '2020-01-02T16:30:00',
                        appointmentTypeDescription: 'Video Link booking',
                        appointmentTypeCode       : 'VLB',
                        locationDescription       : 'VCC ROOM',
                        locationId                : 789,
                        createUserId              : 'API_PROXY_USER',
                        agencyId                  : 'WWI',
                ],
        ])
        whereaboutsApi.getVideoLinkAppointments([
                appointments: [
                        [
                                id               : 1,
                                bookingId        : 1,
                                appointmentId    : 3,
                                court            : 'Leeds',
                                hearingType      : 'MAIN',
                                madeByTheCourt   : true,
                                createdByUsername: 'COURT_USER'
                        ],
                        [
                                id               : 2,
                                bookingId        : 2,
                                appointmentId    : 4,
                                court            : 'A Different Court',
                                hearingType      : 'MAIN',
                                madeByTheCourt   : true,
                                createdByUsername: 'COURT_USER'
                        ]
                ]
        ])
    }
}
