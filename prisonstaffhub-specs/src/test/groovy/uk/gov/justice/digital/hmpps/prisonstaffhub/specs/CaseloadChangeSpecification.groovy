package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import com.github.tomakehurst.wiremock.client.WireMock
import com.github.tomakehurst.wiremock.junit.WireMockRule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.CaseloadChangePage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class CaseloadChangeSpecification extends BrowserReportingSpec {

   static final NOTM_URL = 'http://localhost:20200/'

   @Rule
   Elite2Api elite2api = new Elite2Api()

   @Rule
   OauthApi oauthApi = new OauthApi()

   @Rule
   WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

   @Rule
   public WireMockRule notmServer = new WireMockRule(20200)

   TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)


    def 'Clicking dropdown link takes to caseload change page'() {
        given: 'I am logged in'
        fixture.loginAs ITAG_USER
        when: 'I click the change caseload link'
        elite2api.stubUpdateActiveCaseload()
        oauthApi.stubGetMyDetails(ITAG_USER)
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        whereaboutsApi.stubGroups Caseload.MDI

        $('#info-wrapper').click()
        $('a', text: 'Change caseload').click()
        then: 'I am taken to the caseload change page'
        at CaseloadChangePage
    }

    def 'Changing caseload success path' () {
        fixture.loginAs ITAG_USER
        elite2api.stubUpdateActiveCaseload()
        oauthApi.stubGetMyDetails(ITAG_USER)
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        whereaboutsApi.stubGroups Caseload.MDI
        notmServer.stubFor(
                get(WireMock.urlPathMatching('/.*'))
                        .willReturn(
                                aResponse().withStatus(200)))

        given: "I navigate to the change caseload page"
        to CaseloadChangePage

        when: "I select an option from the dropdown"
        select.click()
        options[0].click()

        and: "I submit"
        submitButton.click()

        then: "I am redirected to the NOTM homepage"
        waitFor { currentUrl ==  NOTM_URL }
        notmServer.verify(WireMock.getRequestedFor(WireMock.urlPathEqualTo('/')))

    }
}