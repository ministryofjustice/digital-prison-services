package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.VisitsResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AddAppointmentPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ConfirmAppointmentPage

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
        form.recurring = "no"
        form.comments = "Test comment."
        form.date = LocalDate.now().format("dd/MM/YYYY")

        submitButton.click()

        then: "I should be presented with the confirmation page"
        at ConfirmAppointmentPage
    }

    def "should load appointment clashes when there are form validation errors"() {
        setupTests()

        elite2api.stubSentenceData(offenders, date,true)
        elite2api.stubCourtEvents(Caseload.LEI,offenders, date, true)
        elite2api.stubActivities(Caseload.LEI, null, date, offenders)
        elite2api.stubVisits(Caseload.LEI, null, date, offenders, VisitsResponse.visits)
        elite2api.stubAppointments(Caseload.LEI, null, date, offenders)
        elite2api.stubExternalTransfers(Caseload.LEI, offenders, date, true)

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
        offenderClashes.text() == '18:00 - 18:30 Visiting room - Visits - Friends'

        when: "I submit"
        submitButton.click()

        then: "I should be presented with missing start time error along with the clashes"
        at AddAppointmentPage
        errorSummary.text() == 'There is a problem\nSelect a start time'
        offenderClashes.text() == '18:00 - 18:30 Visiting room - Visits - Friends'
    }

    def offenderNo = "A12345"

    def date = LocalDate.now().format("YYYY-MM-dd")

    def offenders = List.of(offenderNo)

    def setupTests() {
        fixture.loginAs(UserAccount.ITAG_USER)

        elite2api.stubPostBulkAppointments()

        elite2api.stubOffenderDetails(offenderNo,
                Map.of("firstName", "john",
                        "lastName", "doe",
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
        elite2api.stubAppointmentTypes([Map.of("code", "ACTI", "description", "Activities")])
    }
}
