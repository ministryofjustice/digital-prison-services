package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.RequestBookingConfirmationPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.RequestBookingEnterOffenderDetails
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.RequestBookingSelectCourtPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.RequestBookingStartPage

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class RequestCourtBookingSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should request a video link booking"() {
        whereaboutsApi.stubCourtLocations()
        oauthApi.stubGetEmail("ITAG_USER", "itag@local")
        oauthApi.stubGetUserDetails("ITAG_USER", "staff name")
        elite2api.stubGetAgencies([["agencyId"   : "WWI", "description": "HMP Wandsworth"]])

        def tomorrow = LocalDateTime.now()
                .plusDays(1)
                .format(DateTimeFormatter.ofPattern("dd/MM/YYYY"))

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I'm on the request booking page"
        to RequestBookingStartPage

        and: "I enter all required information"
        at RequestBookingStartPage
        form.date = tomorrow
        form.prison = 'WWI'
        form.startTimeHours = '10'
        form.startTimeMinutes = '00'
        form.endTimeHours = '11'
        form.endTimeMinutes = '00'
        form.preAppointmentRequired = 'yes'
        form.postAppointmentRequired = 'yes'
        submitButton.click()

        and: "I select a court location"
        at RequestBookingSelectCourtPage

        assert prison == 'HMP Wandsworth'
        assert date == LocalDate.now().plusDays(1)
                .format(DateTimeFormatter.ofPattern("d LLLL yyyy"))

        assert startTime == '10:00'
        assert endTime == '11:00'
        assert preStartEndTime == '09:40 to 10:00'
        assert postStartEndTime == '11:00 to 11:20'

        form.hearingLocation = 'London'
        submitButton.click()

        and: "I enter the offender details"
        at RequestBookingEnterOffenderDetails
        form.firstName = 'John'
        form.lastName = 'Doe'
        form.dobDay = 14
        form.dobMonth = 5
        form.dobYear = 1920
        form.comments = 'test'
        submitButton.click()

        then: "I land on the confirmation page with all details played back correctly"
        at RequestBookingConfirmationPage
        assert prison == 'HMP Wandsworth'
        assert date == LocalDate.now().plusDays(1)
                .format(DateTimeFormatter.ofPattern("EEEE d LLLL yyyy"))

        assert startTime == '10:00'
        assert endTime == '11:00'
        assert preStartEndTime == '09:40 to 10:00'
        assert postStartEndTime == '11:00 to 11:20'
        assert name == 'John Doe'
        assert dateOfBirth == '14 May 1920'
        assert courtLocation == 'London'
    }
}
