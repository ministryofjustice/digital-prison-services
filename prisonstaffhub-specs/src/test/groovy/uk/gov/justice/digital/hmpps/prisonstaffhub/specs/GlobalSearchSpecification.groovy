package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.GlobalSearchResponses
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.GlobalSearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class GlobalSearchSpecification extends GebReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should present global search results"() {
        elite2api.stubGlobalSearch('', 'quimby', '', GlobalSearchResponses.response1)
        elite2api.stubImage()

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I do a global search"
        go "/globalsearch?searchText=quimby"

        then: "I should be presented with results"
        at GlobalSearchPage
        tableRows.size() == 3 // Including header row
        def columns1 = tableRows[1].find('td')
        columns1*.text() == ['','Quimby, Fred',
                             'A1234AC',
                             '15/10/1977',
                             'Leeds HMP',
                             'Quimby, Fred']
        def columns2 = tableRows[2].find('td')
        columns2*.text() == ['','Quimby, Arthur',
                             'A1234AA',
                             '15/09/1976',
                             'Moorland HMP',
                             'Quimby, Arthur']
    }

    def "should present global search results with outside descriptions"() {
        elite2api.stubGlobalSearch('', 'common', '', GlobalSearchResponses.response2)
        elite2api.stubImage()

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I do a global search"
        go "/globalsearch?searchText=common"

        then: "I should be presented with results"
        at GlobalSearchPage
        tableRows.size() == 11 // Including header row
        def columns1 = tableRows[1].find('td')
        columns1*.text() == ['','Common, Fred1',
                             'T1001AA',
                             '15/10/1977',
                             'Outside - released from Low Newton (HMP)',
                             'Common, Fred1']
    }

    def "should be able to navigate pages of results"() {
        elite2api.stubGlobalSearch('', 'common', '', GlobalSearchResponses.response2)
        elite2api.stubImage()

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I do a global search resulting in more than 10 rows"
        go "/globalsearch?searchText=common"

        then: "I should be presented with paged results"
        at GlobalSearchPage
        tableRows.size() == 11
        tableRows[10].find('td')[1].text() == 'Common, Fred10'

        when: "I go to next page"
        nextPage.click()

        then: "The second page is shown"
        waitFor { tableRows.size() == 3 }
        at GlobalSearchPage
        tableRows[1].find('td')[1].text() == 'Common, Fred11'

        when: "I go to previous page"
        previousPage.click()

        then: "The first page is shown"
        waitFor { tableRows.size() == 11 }
        at GlobalSearchPage
        tableRows[10].find('td')[1].text() == 'Common, Fred10'
    }
}
