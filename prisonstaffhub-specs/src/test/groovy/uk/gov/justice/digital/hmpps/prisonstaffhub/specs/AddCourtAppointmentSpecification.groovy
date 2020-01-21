package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
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
        def offenders = [offenderNo]
        def date = LocalDate.now().plusDays(1).format("dd/MM/YYYY")

        elite2api.stubSentenceData(offenders, date,true)
        elite2api.stubCourtEvents(Caseload.LEI,offenders, date, true)
        elite2api.stubActivities(Caseload.LEI, null, date, offenders)
        elite2api.stubVisits(Caseload.LEI, null, date, offenders)
        elite2api.stubExternalTransfers(Caseload.LEI, offenders, date, true)

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

        when: "I enter all details and click submit"
        at AddCourtAppointmentPage
        form.location = 1
        form.date = date
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
