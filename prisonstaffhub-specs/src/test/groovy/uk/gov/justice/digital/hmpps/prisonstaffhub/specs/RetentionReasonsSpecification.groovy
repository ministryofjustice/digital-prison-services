package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.DataComplianceApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.NewNomisWebServer
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.NewNomisLandingPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.RetentionReasonsPage

import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor
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
        at NewNomisLandingPage
        dataComplianceApi.verify(putRequestedFor(urlEqualTo("/retention/offenders/A12345")))

        then: "I should be redirected to the new nomis ui"
        newNomisWebServer.verify(getRequestedFor(urlEqualTo("/offenders/${offenderNo}")))
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

        then: "I should be redirected to the new nomis ui"
        newNomisWebServer.verify(getRequestedFor(urlEqualTo("/offenders/${offenderNo}")))
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

        then: "I should be redirected to the new nomis ui"
        newNomisWebServer.verify(getRequestedFor(urlEqualTo("/offenders/${offenderNo}")))
    }

    def offenderNo = "A12345"

    def setupTests() {
        fixture.loginAs(ITAG_USER)

        elite2api.stubImage()
        elite2api.stubOffenderDetails(offenderNo,
                Map.of("firstName", "John",
                        "lastName", "Doe",
                        "dateOfBirth", "1990-01-02",
                        "offenderNo", offenderNo,
                        "agencyId", "LEI"
                ))
        elite2api.stubGetAgencies (
                [Map.of("agencyId", "LEI",
                        "description", "Leeds")])

        dataComplianceApi.stubGetOffenderRetentionReasons()
        dataComplianceApi.stubNoExistingOffenderRecord()

        newNomisWebServer.stubLandingPage()
    }

    def assertInitialPageContent() {

        assert offenderImage
        assert offenderName == "Doe, John"
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
