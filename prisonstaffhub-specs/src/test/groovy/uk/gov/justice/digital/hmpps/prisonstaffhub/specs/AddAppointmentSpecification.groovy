package uk.gov.justice.digital.hmpps.prisonstaffhub.specs


import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.ActivityResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.VisitsResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AddAppointmentPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ConfirmRecurringAppointmentPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ConfirmSingleAppointmentPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.PrePostAppointmentsPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ConfirmVideoLinkPrisonPage

import java.time.LocalDate

class AddAppointmentSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should post appointment and redirect to the confirmation page"() {
        setupTests()

        elite2api.stubVisits(Caseload.LEI, null, date, offenders)

        given: "I am on the add appointment page"
        to AddAppointmentPage

        when: "I fill out the form"
        at AddAppointmentPage
        form.appointmentType = "ACTI"
        form.location = 1
        form.startTimeHours = 23
        form.startTimeMinutes = 55
        form.recurring = "no"
        form.comments = "Test comment."
        form.date = LocalDate.now().format("dd/MM/YYYY")

        submitButton.click()

        then: "I should be presented with the confirmation page"
        at ConfirmSingleAppointmentPage
    }

    def "should handle video link bookings"() {
        setupTests()

        elite2api.stubVisits(Caseload.LEI, null, date, offenders, VisitsResponse.visits)
        elite2api.stubLocation(1)
        elite2api.stubProgEventsAtLocation(1, null, date, ActivityResponse.appointments, false)
        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, date, 'APP')
        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, date, 'VISIT')
        elite2api.stubSingleAppointment(1)

        given: "I am on the add appointment page"
        to AddAppointmentPage

        when: "I fill out the form"
        at AddAppointmentPage
        form.appointmentType = "VLB"
        form.location = 1
        form.startTimeHours = 22
        form.startTimeMinutes = 55
        form.endTimeHours = 23
        form.endTimeMinutes = 55
        form.recurring = "no"
        form.comments = "Test comment."
        form.date = LocalDate.now().format("dd/MM/YYYY")

        submitButton.click()

        and: "I am redirected to the Pre/Post appointments page"
        at PrePostAppointmentsPage

        and: "I fill out the form"
        prePostForm.preAppointment = "yes"
        prePostForm.preAppointmentLocation = 1
        prePostForm.preAppointmentDuration = 15
        prePostForm.postAppointment = "no"

        prePostSubmitButton.click()

        then: "I should be presented with the video link confirmation page for prison staff"
        at ConfirmVideoLinkPrisonPage
    }

    def "should post appointment and redirect to the recurring confirmation page"() {
        setupTests()

        elite2api.stubSentenceData(offenders, date,true)
        elite2api.stubCourtEvents(Caseload.LEI,offenders, date, true)
        elite2api.stubActivities(Caseload.LEI, null, date, offenders)
        elite2api.stubVisits(Caseload.LEI, null, date, offenders)
        elite2api.stubAppointments(Caseload.LEI, null, date, offenders)
        elite2api.stubExternalTransfers(Caseload.LEI, offenders, date, true)

        given: "I am on the add appointment page"
        to AddAppointmentPage

        when: "I fill out the form"
        at AddAppointmentPage
        form.appointmentType = "ACTI"
        form.location = 1
        form.startTimeHours = 23
        form.startTimeMinutes = 55
        form.recurring = "yes"
        form.repeats = "DAILY"
        form.times = 3
        form.comments = "Test comment."
        form.date = LocalDate.now().format("dd/MM/YYYY")

        submitButton.click()

        then: "I should be presented with the confirmation page"
        at ConfirmRecurringAppointmentPage
    }

    def "should load offender events and again when there are form validation errors"() {
        setupTests()

        elite2api.stubVisits(Caseload.LEI, null, date, offenders, VisitsResponse.visits)

        given: "I am on the add appointment page"
        to AddAppointmentPage

        when: "I fill out the form without a start time"
        at AddAppointmentPage
        form.appointmentType = "ACTI"
        form.location = 1
        form.recurring = "no"
        form.date = LocalDate.now().format("dd/MM/YYYY")
        form.comments = "Test comment."

        then: "Clashes should display"
        offenderEvents.text() == '18:00 - 18:30\nVisiting room - Visits - Friends'

        when: "I submit"
        submitButton.click()

        then: "I should be presented with missing start time error along with the clashes"
        at AddAppointmentPage
        errorSummary.text() == 'There is a problem\nSelect a start time'
        offenderEvents.text() == '18:00 - 18:30\nVisiting room - Visits - Friends'
    }

    def "should load location events and again when there are form validation errors for VLB"() {
        setupTests()

        elite2api.stubVisits(Caseload.LEI, null, date, offenders, VisitsResponse.visits)
        elite2api.stubLocation(1)
        elite2api.stubProgEventsAtLocation(1, null, date, ActivityResponse.appointments, false)
        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, date, 'APP')
        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, date, 'VISIT')

        given: "I am on the add appointment page"
        to AddAppointmentPage

        when: "I fill out the form without a start time"
        at AddAppointmentPage
        form.appointmentType = "VLB"
        form.location = 1
        form.recurring = "no"
        form.date = LocalDate.now().format("dd/MM/YYYY")
        form.comments = "Test comment."

        then: "Clashes should display"
        offenderEvents.text() == '18:00 - 18:30\nVisiting room - Visits - Friends'
        locationEvents.text() == '15:30\nMedical Room1 - Medical - Dentist - Appt details'

        when: "I submit"
        submitButton.click()

        then: "I should be presented with missing start time error along with the clashes"
        at AddAppointmentPage
        errorSummary.text() == 'There is a problem\nSelect a start time\nSelect an end time'
        offenderEvents.text() == '18:00 - 18:30\nVisiting room - Visits - Friends'
        locationEvents.text() == '15:30\nMedical Room1 - Medical - Dentist - Appt details'
    }

    def offenderNo = "A12345"

    def date = LocalDate.now().format("YYYY-MM-dd")

    def offenders = List.of(offenderNo)

    def setupTests() {
        fixture.loginAs(UserAccount.ITAG_USER)

        elite2api.stubSentenceData(offenders, date,true)
        elite2api.stubCourtEvents(Caseload.LEI,offenders, date, true)
        elite2api.stubActivities(Caseload.LEI, null, date, offenders)
        elite2api.stubPostAppointments()
        elite2api.stubAppointments(Caseload.LEI, null, date, offenders)
        elite2api.stubExternalTransfers(Caseload.LEI, offenders, date, true)
        elite2api.stubOffenderDetails(offenderNo,
                Map.of("firstName", "john",
                        "lastName", "doe",
                        "bookingId", 1,
                        "offenderNo", offenderNo
                ))
        elite2api.stubAppointmentLocations(
                UserAccount.ITAG_USER.workingCaseload.id,
                [Map.of("locationId", 1,
                        "locationType", "ADJU",
                        "description", "Adjudication",
                        "userDescription", "Adj",
                        "agencyId", "LEI",

                )])
        elite2api.stubAppointmentTypes([Map.of("code", "ACTI", "description", "Activities"), Map.of("code", "VLB", "description", "Video link booking")], )
    }
}
