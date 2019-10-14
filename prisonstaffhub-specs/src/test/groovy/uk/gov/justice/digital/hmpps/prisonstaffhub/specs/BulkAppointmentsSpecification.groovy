package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.Browser
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.BulkAppointmentsAddPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.BulkAppointmentsAddedPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.BulkAppointmentsConfirmPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.BulkAppointmentsUploadCSVPage

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle

class BulkAppointmentsSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should add a non reoccurring bulk appointment with the same start time"() {
        LocalDate startDate = LocalDate.now().plusDays(10)

        fixture.loginAs(UserAccount.ITAG_USER)
        elite2api.stubAppointmentLocations(
                UserAccount.ITAG_USER.workingCaseload.id,
                [Map.of("locationId", 1,
                        "locationType", "ADJU",
                        "description", "Adjudication",
                        "userDescription", "Adj",
                        "agencyId", "LEI",

                )])
        elite2api.stubAppointmentTypes([Map.of("code", "ACTI", "description", "Activities")])
        elite2api.stubBookingOffenders([Map.of(
                "bookingId", 1,
                "offenderNo", "A12345",
                "firstName", "John",
                "lastName", " Doe",
                "agencyId", "LEI"
        )])

        def offenderNos = ['A12345']
        elite2api.stubExternalTransfers(UserAccount.ITAG_USER.workingCaseload, offenderNos, startDate.toString(), true)
        elite2api.stubCourtEvents(UserAccount.ITAG_USER.workingCaseload, offenderNos, startDate.toString(), true)
        elite2api.stubAppointments(UserAccount.ITAG_USER.workingCaseload, "", startDate.toString(), offenderNos)
        elite2api.stubVisits(UserAccount.ITAG_USER.workingCaseload, "", startDate.toString(), offenderNos)
        elite2api.stubPostBulkAppointments()

        given: "I navigate to the add bulk appointments screen"
        to BulkAppointmentsAddPage

        when: "I fill out the appointment details"
        at BulkAppointmentsAddPage
        enterBasicAppointmentDetails(startDate.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT)))
        form.sameTimeAppointments = "yes"
        form.startTimeHours = 10
        form.startTimeMinutes = 10
        form.recurring = "no"
        form.comments = "Test comment."

        and: "I submit"
        submitButton.click()

        and: "I upload a CSV"
        at BulkAppointmentsUploadCSVPage
        selectFile()
        submitButton.click()

        then: "I am on the confirm appointments page"
        at BulkAppointmentsConfirmPage
        appointmentType.text() == "Activities"
        appointmentLocation.text() == "Adj"
        appointmentStartDate.text() == startDate.format(DateTimeFormatter.ofPattern("EEEE dd MMMM yyyy"))
        appointmentStartTime.text() == "10:10"
        prisonersNotFound.children()[1].text() == "offenderNo"
        prisonersFound.children()[1].text() == "Doe John A12345"

        and: "I confirm the appointments I want to create"
        submitButton.click()

        then: "I am presented with the appointments added page"
        at BulkAppointmentsAddedPage
    }

}
