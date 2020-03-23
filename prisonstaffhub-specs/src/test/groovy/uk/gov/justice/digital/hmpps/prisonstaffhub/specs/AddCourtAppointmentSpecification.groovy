package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import groovy.json.JsonOutput
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.ActivityResponse
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.*

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class AddCourtAppointmentSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def offenderNo = "A12345"
    def date = LocalDate.now().plusDays(1).format("dd/MM/YYYY")
    def isoFormatDate = LocalDate.now().plusDays(1).format("YYYY-MM-dd")
    def appointmentLocations = [
            Map.of("locationId", 1, "locationType", "VIDE", "description", "Room 1", "userDescription", "Room 1", "agencyId", "LEI"),
            Map.of("locationId", 2, "locationType", "VIDE", "description", "Room 2", "userDescription", "Room 2", "agencyId", "LEI"),
            Map.of("locationId", 3, "locationType", "VIDE", "description", "Room 3", "userDescription", "Room 3", "agencyId", "LEI")
    ]

    def "should go to select court and rooms pages and then redirect to prison video link confirmation page"() {
        setupTestsWithAvailability()
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

        and: "I am redirected to select court page"
        at SelectCourtAppointmentCourtPage
        assert offenderName == 'John Doe'
        assert prison == 'Leeds'
        assert startTime == '10:55'
        assert endTime == '11:55'
        assert date == date.toString()

        and: "I select a court"
        selectCourtForm.court = 'london'
        selectCourtSubmitButton.click()

        and: "I am redirected to select rooms page"
        at SelectCourtAppointmentRoomsPage

        and: "I fill out the form"
        selectRoomsForm.selectPreAppointmentLocation = 1
        selectRoomsForm.selectMainAppointmentLocation = 2
        selectRoomsForm.selectPostAppointmentLocation = 3

        selectRoomsSubmitButton.click()

        then: "I should be presented with the video link confirmation page for prison staff"
        at ConfirmVideoLinkPrisonPage
        assert offenderName == 'John Doe'
        assert prison == 'Leeds'
        assert room == 'Room 2'
        assert startTime == '10:55'
        assert endTime == '11:55'
        assert date == date.toString()
        assert legalBriefingBefore == 'Room 1 - 10:35 to 10:55'
        assert legalBriefingAfter == 'Room 3 - 11:55 to 12:15'
        assert courtLocation == 'London'
    }

    def "should redirect to court video link confirmation page"() {
        setupTestsWithAvailability()
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

        and: "I am redirected to select court page"
        at SelectCourtAppointmentCourtPage

        and: "I select a court"
        selectCourtForm.court = 'london'
        selectCourtSubmitButton.click()

        and: "I am redirected to select rooms page"
        at SelectCourtAppointmentRoomsPage

        and: "I fill out the form"
        selectRoomsForm.selectMainAppointmentLocation = 2

        selectRoomsSubmitButton.click()

        then: "I should be presented with the video link confirmation page for prison staff"
        at ConfirmVideoLinkCourtPage
        assert offenderName == 'John Doe'
        assert prison == 'Leeds'
        assert room == 'Room 2'
        assert startTime == '10:55'
        assert endTime == '11:55'
        assert date == date.toString()
        assert $('.qa-preCourtHearingBriefing-value').displayed == false
        assert $('.qa-postCourtHearingBriefing-value').displayed == false
        assert courtLocation == 'London'
    }

    def "should be redirected to no availability for today page"() {
        shearedTestSetup()

        def startTime = LocalDateTime.now()
                .plusDays(1)
                .withHour(8)
                .withMinute(0)
                .toString()

        def endTime = LocalDateTime.now()
                .plusDays(1)
                .withHour(18)
                .withMinute(0)
                .toString()

        def fullDayAppointmentForLocationOne = [
                offenderNo      : "A1234AA",
                firstName       : "ARTHUR",
                lastName        : "ANDERSON",
                cellLocation    : "LEI-A-1-1",
                comment         : "Appt details",
                event           : "MEDE",
                eventId         : 106,
                eventDescription: "Medical - Dentist",
                eventLocation   : "Medical Room1",
                startTime       : startTime,
                endTime         : endTime,
                locationId      : 1
        ]

        def fullDayAppointmentForLocationTwo = [
                offenderNo      : "A1234AA",
                firstName       : "ARTHUR",
                lastName        : "ANDERSON",
                cellLocation    : "LEI-A-1-1",
                comment         : "Appt details",
                event           : "MEDE",
                eventId         : 107,
                eventDescription: "Medical - Dentist",
                eventLocation   : "Medical Room1",
                startTime       : startTime,
                endTime         : endTime,
                locationId      : 2
        ]


        def location = [
                Map.of("locationId", 1, "locationType", "VIDE", "description", "Room 1", "userDescription", "Room 1", "agencyId", "LEI"),
                Map.of("locationId", 2, "locationType", "VIDE", "description", "Room 2", "userDescription", "Room 2", "agencyId", "LEI"),
        ]

        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, isoFormatDate, 'APP', JsonOutput.toJson([fullDayAppointmentForLocationOne]))
        elite2api.stubUsageAtLocation(Caseload.LEI, 2, null, isoFormatDate, 'APP', JsonOutput.toJson([fullDayAppointmentForLocationTwo]))

        elite2api.stubAppointmentLocations(Caseload.LEI.toString(), location)
        elite2api.stubOffenderDetails(offenderNo, Map.of("firstName", "john", "lastName", "doe", "bookingId", 1, "offenderNo", offenderNo))
        elite2api.stubAppointmentTypes([Map.of("code", "VLB", "description", "Video link booking")])


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
        form.preAppointmentRequired = "yes"
        form.postAppointmentRequired = "yes"
        submitButton.click()

        then: "I am redirected no availability today page"
        at NoAvailabilityPage
        def correctDate = LocalDate.now().plusDays(1)
                .format(DateTimeFormatter.ofPattern("EEEE d LLLL yyyy"))

        info == "There are no bookings available on ${correctDate}."
    }

    def "should be redirected to no availability for requested time page"() {
        shearedTestSetup()

        def startTime = LocalDateTime.now()
                .plusDays(1)
                .withHour(8)
                .withMinute(0)
                .toString()

        def endTime = LocalDateTime.now()
                .plusDays(1)
                .withHour(15)
                .withMinute(0)
                .toString()

        def fullDayAppointmentForLocationOne = [
                offenderNo      : "A1234AA",
                firstName       : "ARTHUR",
                lastName        : "ANDERSON",
                cellLocation    : "LEI-A-1-1",
                comment         : "Appt details",
                event           : "MEDE",
                eventId         : 106,
                eventDescription: "Medical - Dentist",
                eventLocation   : "Medical Room1",
                startTime       : startTime,
                endTime         : endTime,
                locationId      : 1
        ]

        def fullDayAppointmentForLocationTwo = [
                offenderNo      : "A1234AA",
                firstName       : "ARTHUR",
                lastName        : "ANDERSON",
                cellLocation    : "LEI-A-1-1",
                comment         : "Appt details",
                event           : "MEDE",
                eventId         : 107,
                eventDescription: "Medical - Dentist",
                eventLocation   : "Medical Room1",
                startTime       : startTime,
                endTime         : endTime,
                locationId      : 2
        ]


        def location = [
                Map.of("locationId", 1, "locationType", "VIDE", "description", "Room 1", "userDescription", "Room 1", "agencyId", "LEI"),
                Map.of("locationId", 2, "locationType", "VIDE", "description", "Room 2", "userDescription", "Room 2", "agencyId", "LEI"),
        ]

        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, isoFormatDate, 'APP', JsonOutput.toJson([fullDayAppointmentForLocationOne]))
        elite2api.stubUsageAtLocation(Caseload.LEI, 2, null, isoFormatDate, 'APP', JsonOutput.toJson([fullDayAppointmentForLocationTwo]))

        elite2api.stubAppointmentLocations(Caseload.LEI.toString(), location)
        elite2api.stubOffenderDetails(offenderNo, Map.of("firstName", "john", "lastName", "doe", "bookingId", 1, "offenderNo", offenderNo))
        elite2api.stubAppointmentTypes([Map.of("code", "VLB", "description", "Video link booking")])

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
        form.preAppointmentRequired = "yes"
        form.postAppointmentRequired = "yes"
        submitButton.click()

        then: "I am redirected no availability today page"
        at NoAvailabilityPage
        def correctDate = LocalDate.now().plusDays(1)
                .format(DateTimeFormatter.ofPattern("EEEE d LLLL yyyy"))

        info == "There are no bookings available on ${correctDate} between 10:35 and 12:15."
    }


    def setupTestsWithAvailability() {
        shearedTestSetup()
        elite2api.stubUsageAtLocation(Caseload.LEI, 1, null, isoFormatDate, 'APP', ActivityResponse.appointments)
        elite2api.stubUsageAtLocation(Caseload.LEI, 2, null, isoFormatDate, 'APP', ActivityResponse.appointments)
        elite2api.stubUsageAtLocation(Caseload.LEI, 3, null, isoFormatDate, 'APP', ActivityResponse.appointments)
        elite2api.stubAppointmentLocations(Caseload.LEI.toString(), appointmentLocations)
    }

    def shearedTestSetup() {
        elite2api.stubOffenderDetails(offenderNo, Map.of("firstName", "john", "lastName", "doe", "bookingId", 1, "offenderNo", offenderNo))
        elite2api.stubAppointmentTypes([Map.of("code", "VLB", "description", "Video link booking")])
        elite2api.stubAgencyDetails('LEI', [agencyId: "LEI", description: "Leeds", agencyType: "INST"])
        oauthApi.stubGetEmail('COURT_USER')
        oauthApi.stubGetEmail('ITAG_USER')
        whereaboutsApi.stubCourtLocations()
        whereaboutsApi.stubAddVideoLinkAppointment()
    }
}
