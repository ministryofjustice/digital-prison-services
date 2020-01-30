package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.ActivityResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AddCourtAppointmentPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ConfirmVideoLinkPrisonPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ConfirmVideoLinkCourtPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SelectCourtAppointmentRoomsPage

import java.time.LocalDate

class AddCourtAppointmentSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def offenderNo = "A12345"
    def offenders = [offenderNo]
    def date = LocalDate.now().plusDays(1).format("dd/MM/YYYY")
    def isoFormatDate = LocalDate.now().plusDays(1).format("YYYY-MM-dd")
    def appointmentLocations = [
            Map.of("locationId", 1,"locationType", "COURT","description", "Room 1","userDescription","Room 1","agencyId","LEI"),
            Map.of("locationId", 2,"locationType", "COURT","description", "Room 2","userDescription","Room 2","agencyId","LEI"),
            Map.of("locationId", 3,"locationType", "COURT","description", "Room 3","userDescription","Room 3","agencyId","LEI")
    ]

    def "should go to select court appointment rooms page and then redirect to prison video link confirmation page"() {
        setupTests()
        fixture.loginAs(UserAccount.ITAG_USER)

        given: "I am on the add court appointment page"
        to AddCourtAppointmentPage

        when: "I enter all details and click submit"
        at AddCourtAppointmentPage
        form.date = date
        form.startTimeHours = 10
        form.startTimeMinutes = 55
        form.endTimeHours = 11
        form.endTimeMinutes = 55
        form.preAppointmentRequired = "yes"
        form.postAppointmentRequired = "yes"
        submitButton.click()

        and: "I am redirected to select court appointment rooms page"
        at SelectCourtAppointmentRoomsPage

        and: "I fill out the form"
        selectRoomsForm.preAppointmentLocation = 1
        selectRoomsForm.mainAppointmentLocation = 2
        selectRoomsForm.postAppointmentLocation = 3

        selectRoomsSubmitButton.click()

        then: "I should be presented with the video link confirmation page for prison staff"
        at ConfirmVideoLinkPrisonPage
    }

    def "should redirect to court video link confirmation page"() {
        setupTests()
        fixture.loginAs(UserAccount.COURT_USER)

        given: "I am on the add court appointment page"
        to AddCourtAppointmentPage

        when: "I enter all details and click submit"
        at AddCourtAppointmentPage
        form.date = date
        form.startTimeHours = 10
        form.startTimeMinutes = 55
        form.endTimeHours = 11
        form.endTimeMinutes = 55
        form.preAppointmentRequired = "no"
        form.postAppointmentRequired = "no"
        submitButton.click()

        and: "I am redirected to select court appointment rooms page"
        at SelectCourtAppointmentRoomsPage

        and: "I fill out the form"
        selectRoomsForm.mainAppointmentLocation = 2

        selectRoomsSubmitButton.click()

        then: "I should be presented with the video link confirmation page for prison staff"
        at ConfirmVideoLinkCourtPage
    }

    def setupTests() {
        elite2api.stubSentenceData(offenders, date,true)
        elite2api.stubCourtEvents(Caseload.LEI,offenders, date, true)
        elite2api.stubActivities(Caseload.LEI, null, date, offenders)
        elite2api.stubVisits(Caseload.LEI, null, date, offenders)
        elite2api.stubExternalTransfers(Caseload.LEI, offenders, date, true)
        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, isoFormatDate, 'VISIT')
        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, isoFormatDate, 'APP')
        elite2api.stubUsageAtLocation(Caseload.LEI, 2, null, isoFormatDate, 'VISIT')
        elite2api.stubUsageAtLocation(Caseload.LEI, 2, null, isoFormatDate, 'APP')
        elite2api.stubUsageAtLocation(Caseload.LEI, 3, null, isoFormatDate, 'VISIT')
        elite2api.stubUsageAtLocation(Caseload.LEI, 3, null, isoFormatDate, 'APP')
        elite2api.stubLocation(1)
        elite2api.stubLocation(2)
        elite2api.stubLocation(3)
        elite2api.stubProgEventsAtLocation(1, null, isoFormatDate, ActivityResponse.appointments, false)
        elite2api.stubProgEventsAtLocation(2, null, isoFormatDate, ActivityResponse.appointments, false)
        elite2api.stubProgEventsAtLocation(3, null, isoFormatDate, ActivityResponse.appointments, false)
        elite2api.stubSingleAppointment(1)
        elite2api.stubSingleAppointment(2)
        elite2api.stubSingleAppointment(3)
        elite2api.stubOffenderDetails(offenderNo, Map.of("firstName", "john","lastName", "doe","bookingId", 1,"offenderNo", offenderNo))
        elite2api.stubAppointmentLocations('LEI', appointmentLocations)
        elite2api.stubAppointmentTypes([Map.of("code", "VLB", "description", "Video link booking")])
        elite2api.stubAgencyDetails('LEI', [agencyId: "LEI", description: "Leeds", agencyType: "INST"])
        oauthApi.stubGetEmail('COURT_USER')
        oauthApi.stubGetEmail('ITAG_USER')
    }
}
