package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import com.github.tomakehurst.wiremock.client.WireMock
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi

import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload

import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.EditAlertPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class EditAlertSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    def "should update an existing alert"() {
        def offenderNo = "A12345"

        elite2api.stubOffenderDetails(false,
                Map.of("bookingId", 1, "firstName", "john", "lastName", "doe", "offenderNo", offenderNo))

        oauthApi.stubValidOAuthTokenLogin()
        oauthApi.stubSystemUserTokenRequest()
        oauthApi.stubGetMyDetails(ITAG_USER)
        oauthApi.stubGetMyRoles([{roleCodes: 'UPDATE_ALERT'}])
        elite2api.stubGetMyCaseloads([Caseload.LEI])
        elite2api.stubPutAlert(1,1 )
        elite2api.stubGetAlert(1, 1, Map.of(
                "alertId", 1,
               "comment", "test"
        ))
        elite2api.stubAlertTypes()
        elite2api.stubIepSummariesForBookings([1])
        elite2api.stubStaffRoles(-2, 'LEI')
        elite2api.stubCaseNotesSummary()

        given: "I am on the edit / close alert form"
        to EditAlertPage

        when: "I edit a comment, select either yes or no and click continue"
        form.comment = "Test"
        form.alertStatus = 'No'
        submit.click()

        then: "The alert should be updated"
        elite2api.verify(WireMock.putRequestedFor(WireMock.urlEqualTo("/api/bookings/1/alert/1")))

        // then: "I should be redirected to the prisoner profile alerts page"
        // newNomisWebServer.verify(WireMock.getRequestedFor(WireMock.urlEqualTo("/offenders/${offenderNo}/alerts?alertStatus=open")))
    }
}
