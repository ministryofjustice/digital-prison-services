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
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.*

import java.time.LocalDate

class RetentionReasonsSpecification extends BrowserReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should load the retention reasons page"() {
        setupTests()

        given: "I am on the retention reasons page"
        to RetentionReasonsPage
    }

    def offenderNo = "A12345"

    def setupTests() {
        fixture.loginAs(UserAccount.ITAG_USER)

        elite2api.stubImage()
        elite2api.stubOffenderDetails(offenderNo,
                Map.of("firstName", "john",
                        "lastName", "doe",
                        "dateOfBirth", "1990-01-02",
                        "offenderNo", offenderNo,
                        "agencyId", "LEI"
                ))
        elite2api.stubGetAgencies (
                [Map.of("agencyId", "LEI",
                        "description", "Leeds")])
    }
}
