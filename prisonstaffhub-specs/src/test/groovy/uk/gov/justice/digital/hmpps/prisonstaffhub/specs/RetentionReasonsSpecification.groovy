package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import com.github.tomakehurst.wiremock.client.WireMock
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.DataComplianceApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.NewNomisWebServer
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.RetentionReasonsPage

import static com.github.tomakehurst.wiremock.client.WireMock.putRequestedFor
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class RetentionReasonsSpecification extends BrowserReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    @Rule
    DataComplianceApi dataComplianceApi = new DataComplianceApi()

    @Rule
    NewNomisWebServer newNomisWebServer = new NewNomisWebServer()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should load the retention reasons page"() {

        setupTests()

        given: "I am on the retention reasons page"
        to RetentionReasonsPage

        at RetentionReasonsPage
        assertInitialPageContent()
        assert lastUpdateTimestamp == ""
        assert lastUpdateUser == ""
    }

    def "should load the retention reasons page with existing reasons"() {

        setupTests()
        dataComplianceApi.stubExistingOffenderRecord()

        given: "I am on the retention reasons page"
        to RetentionReasonsPage

        at RetentionReasonsPage
        assertInitialPageContent()
        assert checkBoxOther.value() == "OTHER"
        assert moreDetailOther.value() == "Some other reason"
        assert lastUpdateTimestamp == "01/02/2020 - 03:04 (UTC)"
        assert lastUpdateUser == "SOME_USER"

    }

    def "should be able to create a new retention record"() {

        setupTests()
        dataComplianceApi.stubCreateOffenderRecord();

        given: "I am on the retention reasons page"
        to RetentionReasonsPage

        when: "I select reasons for retention"
        at RetentionReasonsPage
        checkBoxHighProfile.click()
        checkBoxOther.click()
        moreDetailOther = "Some other reason"

        and: "I click the update button"
        at RetentionReasonsPage
        updateButton.click()

        then: "The retention reasons should be updated"
        dataComplianceApi.verify(putRequestedFor(urlEqualTo("/retention/offenders/A12345")))
    }

    def "should be able to update a select retention record"() {

        setupTests()
        dataComplianceApi.stubExistingOffenderRecord()
        dataComplianceApi.stubUpdateOffenderRecord()

        given: "I am on the retention reasons page"
        to RetentionReasonsPage

        when: "I update reasons for retention"
        at RetentionReasonsPage
        checkBoxHighProfile.click()
        checkBoxOther.click()

        and: "I click the update button"
        at RetentionReasonsPage
        updateButton.click()

        then: "The retention reasons should be updated"
        dataComplianceApi.verify(putRequestedFor(urlEqualTo("/retention/offenders/A12345")))
    }

    def "should be able to cancel an update of retention reasons"() {

        setupTests()

        given: "I am on the retention reasons page"
        to RetentionReasonsPage

        when: "I click cancel"
        at RetentionReasonsPage
        cancelButton.click()

        then: "The retention reasons are not updated"
        dataComplianceApi.verify(0, putRequestedFor(urlEqualTo("/retention/offenders/A12345")))
    }

    def "should be prevented from submitting empty details"() {

        setupTests()
        dataComplianceApi.stubExistingOffenderRecord()

        given: "I am on the retention reasons page"
        to RetentionReasonsPage

        when: "I provide empty details"
        at RetentionReasonsPage
        moreDetailOther = ""

        and: "I click the update button"
        at RetentionReasonsPage
        updateButton.click()

        then: "The retention reasons should not be updated"
        dataComplianceApi.verify(0, putRequestedFor(urlEqualTo("/retention/offenders/A12345")))

        then: "The page is re-loaded with an error message"
        at RetentionReasonsPage
        assert errorSummary
    }

    def offenderNo = "A12345"

    def setupTests() {
        fixture.loginAs(ITAG_USER)

        elite2api.stubImage()
        elite2api.stubAgencyDetails("LEI", [ description: "Leeds"])
        elite2api.stubOffenderDetails(offenderNo,
                Map.of("firstName", "John",
                        "lastName", "Doe",
                        "dateOfBirth", "1990-02-01",
                        "offenderNo", offenderNo,
                        "agencyId", "LEI"
                ))

        dataComplianceApi.stubGetOffenderRetentionReasons()
        dataComplianceApi.stubNoExistingOffenderRecord()

        newNomisWebServer.stubLandingPage()
    }

    def assertInitialPageContent() {

        assert offenderImage
        assert offenderName == "Doe, John"
        assert offenderNumber == offenderNo
        assert offenderDob == "01/02/1990"
        assert offenderAgency == "Leeds"

        assert checkBoxHighProfile
        assert checkBoxOther
        assert moreDetailOther

        assert updateButton
        assert cancelButton
    }
}
