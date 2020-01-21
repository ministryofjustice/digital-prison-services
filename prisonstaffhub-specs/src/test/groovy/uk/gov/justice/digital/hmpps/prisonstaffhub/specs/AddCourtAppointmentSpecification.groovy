package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AddCourtAppointmentPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.PrePostAppointmentsPage

import java.time.LocalDate

class AddCourtAppointmentSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should redirect to pre and post appointments page"() {
        def offenderNo = "A12345"

        fixture.loginAs(UserAccount.ITAG_USER)
        elite2api.stubOffenderDetails(offenderNo,
                Map.of("firstName", "john",
                        "lastName", "doe",
                        "offenderNo", offenderNo))

        elite2api.stubAppointmentLocations(
                UserAccount.ITAG_USER.workingCaseload.id,
                [Map.of("locationId", 1,
                        "locationType", "ADJU",
                        "description", "Adjudication",
                        "userDescription", "Adj",
                        "agencyId", "LEI",

                )])

        elite2api.stubAppointmentTypes([
                 Map.of("code", "VLB", "description", "Video link booking")]
        )

        given: "I am on the add court appointment page"
        to AddCourtAppointmentPage
        at AddCourtAppointmentPage

        when: "I enter all details and click submit"
        form.location = 1
        form.date = LocalDate.now().plusDays(1).format("dd/MM/YYYY")
        form.startTimeHours = 10
        form.startTimeMinutes = 55
        form.endTimeHours = 11
        form.endTimeMinutes = 55
        form.comments = "Test comment."
        submitButton.click()

        then: "I should be taken to the pre post appointments page"
        at PrePostAppointmentsPage
    }
}
