package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.InTodayPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.OutTodayPage


import java.time.LocalDate

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class MovementsSpecification extends GebReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "in-today"() {

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count In today page"

        stubFlags(["A1234AA", "G0000AA"])

        elite2api.stubGetMovementsIn(ITAG_USER.workingCaseload, LocalDate.now())
        elite2api.stubImage()
        to InTodayPage

        then:
        at InTodayPage

        def cellTextInRows = tableRows.collect { row -> row.children().collect { cell -> cell.text() } }

        cellTextInRows == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', 'A-02-011', '23:59', 'Outside', ''],
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', 'A-01-011', '01:01', 'Hull (HMP)', 'ACCT OPENE‑LIST']
        ]
    }

    def "out-today"() {

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count out today page"

        stubFlags(["A1234AA", "G0000AA"])

        elite2api.stubGetMovementsOut(ITAG_USER.workingCaseload, LocalDate.now())
        elite2api.stubImage()
        to OutTodayPage

        then:
        at OutTodayPage

        getCells(tableRows) == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', '23:59', 'Normal transfer', ''],
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', '01:01', 'Normal transfer', 'ACCT OPENE‑LIST']
        ]
    }

    def "sort out-today results via header"() {
        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count out today page"
        stubFlags(["A1234AA", "G0000AA"])
        elite2api.stubGetMovementsOut(ITAG_USER.workingCaseload, LocalDate.now())
        elite2api.stubImage()
        to OutTodayPage

        then:
        at OutTodayPage

        getCells(tableRows) == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', '23:59', 'Normal transfer', ''],
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', '01:01', 'Normal transfer', 'ACCT OPENE‑LIST']
        ]

        then: "clicking on the name to sort the results A-Z"
        nameSortAsc.click()
        at OutTodayPage

        getCells(tableRows) == [
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', '01:01', 'Normal transfer', 'ACCT OPENE‑LIST'],
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', '23:59', 'Normal transfer', '']
        ]

        then: "clicking on the name to sort the results Z-A"
        nameSortDesc.click()
        at OutTodayPage

        getCells(tableRows) == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', '23:59', 'Normal transfer', ''],
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', '01:01', 'Normal transfer', 'ACCT OPENE‑LIST']
        ]

    }


    def stubFlags(List offenders) {
        oauthApi.stubSystemUserTokenRequest()
        elite2api.stubSystemAccessAlerts(offenders)
        elite2api.stubAssessments(offenders)
    }

    def getCells(def tableRows) {
        return tableRows.collect { row -> row.children().collect { cell -> cell.text() } }
    }
}
