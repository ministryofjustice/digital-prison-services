package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.module.FormElement
import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.EstablishmentRollPage

class EstablishmentRollBlockSpecification  extends GebReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should present house block roll counts"() {
        elite2api.stubEstablishmentRollCount(ITAG_USER.workingCaseload.id)

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count page"
        go "/establishmentroll"

        then: "I should be presented with roll counts for each house block"
        at EstablishmentRollPage

        def movementsBlock = getReadableColumns(blocks[0])
        def firstBlock = getReadableColumns(blocks[1])
        def totalsBlock = getReadableColumns(blocks[3])

        movementsBlock == [
            'Movements',
            'Unlock roll', '329',
            'In today', '1',
            'Out today', '2',
            'Current roll', '328',
            'Unassigned', '4'
        ]

        firstBlock == [
            'Housing Block 1',
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
