package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AddBulkAppointmentsPage

import java.time.LocalDate

class AddBulkAppointmentsSpecification extends GebReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should add bulk appointments"() {

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
        elite2api.stubBookingOffenders([Map.of("bookingId", 1, "offenderNo", "A12345", "firstName", "John", "lastName", " Doe")])
        elite2api.stubPostBulkAppointments()

        given: "I navigate to the add bulk appointments screen"
        go AddBulkAppointmentsPage.url

        when: "I fill out the appointments details"
        at AddBulkAppointmentsPage
        enterAppointmentDetails(LocalDate.now().year.toString())

        and: "I import offenders via csv file"
        selectFile()

        and: "I will be presented with offenders from the csv file"
        waitFor { tableRows.size() > 0 }
        tableRows[0].children()[0].text() == "A12345"
        tableRows[0].children()[1].text() == "Doe"
        tableRows[0].children()[2].text() == "John"

        and: "I click add appointments button"
        submitButton.click()

        then:
        waitFor { successMessage.displayed }
    }

}
