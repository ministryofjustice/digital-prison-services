package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import com.github.tomakehurst.wiremock.client.WireMock
import com.github.tomakehurst.wiremock.junit.WireMockRule
import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.GlobalSearchResponses
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.GlobalSearchPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse
import static com.github.tomakehurst.wiremock.client.WireMock.get
import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class AgencySelectionSpecification extends GebReportingSpec {

    static final NOTM_URL = 'http://localhost:3000/'
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    public WireMockRule notmServer = new WireMockRule(3000)

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def 'Agency selection from global search page redirects to new-nomis-ui'() {
        elite2api.stubGlobalSearch('', 'quimby', '', GlobalSearchResponses.response1)
        elite2api.stubImage()

        given: 'I am logged in'
        fixture.loginAs(ITAG_USER)

        and: 'I do a global search'
        go "/globalsearch?searchText=quimby"
        at GlobalSearchPage

        when: 'I select another agency'
        elite2api.stubUpdateActiveCaseload()
        notmServer.stubFor(
                get(WireMock.urlPathMatching('/.*'))
                .willReturn(
                    aResponse().withStatus(200)))

        $('#info-wrapper').click()
        $('#menu-option-MDI').click()

        then: 'The browser goes to the new-nomis-ui url'
        waitFor { currentUrl ==  NOTM_URL }
        notmServer.verify(WireMock.getRequestedFor(WireMock.urlPathEqualTo('/')))
    }

    def 'Agency selection from a page other than global search remains in app'() {
        given: 'I am logged in'
        fixture.loginAs ITAG_USER

        when: 'I select another agency'
        elite2api.stubUpdateActiveCaseload()
        elite2api.stubGetMyDetails(ITAG_USER)
        elite2api.stubGetMyCaseloads(ITAG_USER.caseloads)
        elite2api.stubGroups Caseload.MDI
        elite2api.stubActivityLocations()

        $('#info-wrapper').click()
        $('#menu-option-MDI').click()

        then: 'I remain on the search page'
        at SearchPage
    }
}