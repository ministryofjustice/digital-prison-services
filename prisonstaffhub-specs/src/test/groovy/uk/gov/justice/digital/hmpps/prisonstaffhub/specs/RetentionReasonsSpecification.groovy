package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.DataComplianceApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.RetentionReasonsPage

class RetentionReasonsSpecification extends BrowserReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    @Rule
    DataComplianceApi dataComplianceApi = new DataComplianceApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi, dataComplianceApi)

    def "should load the retention reasons page"() {
        setupTests()

        given: "I am on the retention reasons page"
        to RetentionReasonsPage

        at RetentionReasonsPage
        assertInitialPageContent()
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

        dataComplianceApi.stubGetOffenderRetentionReasons()
    }

    def assertInitialPageContent() {

        assert offenderImage
        assert offenderName == "doe, john"
        assert offenderNumber == offenderNo
        assert offenderDob == "1990-01-02"
        assert offenderAgency == "Leeds"

        assert checkBoxHighProfile
        assert checkBoxOther
        assert moreDetailOther

        assert updateButton
        assert cancelButton
    }
}
