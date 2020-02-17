package uk.gov.justice.digital.hmpps.prisonstaffhub.specs


import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.EstablishmentRollPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class EstablishmentRollBlockSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should present house block roll counts"() {
        elite2api.stubEstablishmentRollCount(ITAG_USER.workingCaseload.id)

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count page"
        go "/establishment-roll"

        then: "I should be presented with roll counts for each house block"
        at EstablishmentRollPage

        def movementsBlock = getReadableColumns(blocks[0])
        def firstBlock = getReadableColumns(blocks[1])
        def totalsBlock = getReadableColumns(blocks[3])

        movementsBlock == [
            "Today's movements",
            'Unlock roll', '329',
            'In today', '1',
            'Out today', '2',
            'Current roll', '328',
            'In reception', '2',
            'En-route', '6'
        ]

        firstBlock == [
            'Houseblock 1',
            'Beds in use', '156',
            'Currently in cell', '154',
            'Currently out', '2',
            'Operational cap.', '170',
            'Net vacancies', '14',
            'Out of order', '0'
        ]

        totalsBlock == [
            'Totals',
            'Total roll', '328',
            'Total in cell', '326',
            'Total out', '2',
            'Total op. cap.', '350',
            'Total vacancies', '22',
            'Total out of order', '1'
        ]
    }

    def getReadableColumns(def columns) {
        return columns.text().split('\n').collect{i -> i.toString()};
    }
}
