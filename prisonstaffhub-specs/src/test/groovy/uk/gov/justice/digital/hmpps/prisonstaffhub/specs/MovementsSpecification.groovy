package uk.gov.justice.digital.hmpps.prisonstaffhub.specs


import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.*

import java.time.LocalDate

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class MovementsSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "in-today"() {

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count In today page"
        stubFlags(["A1234AA", "G0000AA"])

        elite2api.stubGetMovementsIn(ITAG_USER.workingCaseload, LocalDate.now())
        elite2api.stubImage()

        elite2api.stubIepSummariesForBookings([-1L, -2L])

        to InTodayPage

        then:
        at InTodayPage

        getCells(tableRows) == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', 'Basic', 'A-02-011', '23:59', 'Outside', ''],
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', 'Basic', 'A-01-011', '01:01', 'Hull (HMP)', 'ACCT OPENE‑LISTCAT A']
        ]
    }

    def "out-today"() {

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count out today page"

        stubFlags(["A1234AA", "G0000AA"])

        elite2api.stubGetMovementsOut(ITAG_USER.workingCaseload, LocalDate.now())
        elite2api.stubImage()
        oauthApi.stubGetMyRoles()
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
        oauthApi.stubGetMyRoles()
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

    def "in-reception"() {
        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count out today page"

        stubFlags(["A1234AA", "G0000AA"])

        elite2api.stubInReception(ITAG_USER.workingCaseload)
        elite2api.stubIepSummariesForBookings([-1, -2])
        elite2api.stubImage()
        oauthApi.stubGetMyRoles()
        elite2api.stubRecentMovements([["offenderNo": "A1234AA", "fromAgencyDescription": "Low Newton (HMP)"]])
        to InReception

        then:
        at InReception

        getCells(tableRows) == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', '', 'Basic', ''],
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', 'Low Newton (HMP)', 'Basic', 'ACCT OPENE‑LIST']
        ]
    }

    def 'Currently out'() {
        given: 'I am logged in'
        fixture.loginAs(ITAG_USER)

        when: 'I navigate to the establishment Currently out page'

        elite2api.stubCurrentlyOut(123456L)
        elite2api.stubImage()
        oauthApi.stubGetMyRoles()
        elite2api.stubRecentMovements([
                [
                    "offenderNo"         : "A1234AA",
                    "toAgencyDescription": "Low Newton (HMP)",
                    "commentText"        : "Comment text"
                ]
        ])
        stubFlags(["A1234AA", "G0000AA"])
        elite2api.stubLocation(123456L)
        elite2api.stubIepSummariesForBookings([-1, -2])


        to CurrentlyOutPage

        then:
        at CurrentlyOutPage

        getCells(tableRows) == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', 'A-02-011', 'Basic', '', '', ''],
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', 'A-01-011', 'Basic', 'ACCT OPENE‑LISTCAT A', 'Low Newton (HMP)', 'Comment text']
        ]
    }

    def 'Total out'() {
        given: 'I am logged in'
        fixture.loginAs(ITAG_USER)

        when: 'I navigate to the establishment Total out page'

        elite2api.stubTotalOut('LEI')
        elite2api.stubImage()
        oauthApi.stubGetMyRoles()
        elite2api.stubRecentMovements([
                [
                        "offenderNo"         : "A1234AA",
                        "toAgencyDescription": "Low Newton (HMP)",
                        "commentText"        : "Comment text"
                ]
        ])
        stubFlags(["A1234AA", "G0000AA"])
        elite2api.stubLocation(123456L)
        elite2api.stubIepSummariesForBookings([-1, -2])


        to TotalOutPage

        then:
        at TotalOutPage

        getCells(tableRows) == [
                ['', 'Aaaaa, Aaaaa', 'G0000AA', '31/12/1980', 'A-02-011', 'Basic', '', '', ''],
                ['', 'Aaaaa, Aaaab', 'A1234AA', '01/01/1980', 'A-01-011', 'Basic', 'ACCT OPENE‑LISTCAT A', 'Low Newton (HMP)', 'Comment text']
        ]
    }



    def "en-route"() {
        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I navigate to the establishment roll count en route page"

        stubFlags(["A1234AA", "G0000AA"])
        elite2api.stubInReception(ITAG_USER.workingCaseload.id)
        elite2api.stubImage()
        oauthApi.stubGetMyRoles()

        def movements = [
                Map.of(
                        "firstName","firstname1",
                        "lastName", "lastName1",
                        "offenderNo", "A1234AA",
                        "fromAgencyDescription","Low Newton (HMP)",
                        "movementReasonDescription","Normal transfer",
                        "movementTime", "12:00:00",
                        "movementDate", "2019-10-10",
                        "dateOfBirth", "2019-10-10"
                ),
                Map.of(
                        "firstName","firstName2",
                        "lastName", "lastName2",
                        "offenderNo", "G0000AA",
                        "fromAgencyDescription", "Leeds (HMP)",
                        "movementReasonDescription", "Normal transfer",
                        "movementTime", "13:00:00",
                        "movementDate", "2018-10-10",
                        "dateOfBirth", "1980-10-10"
                ),
        ]

        elite2api.stubEnRoute(ITAG_USER.workingCaseload.id, movements)
        EnRoutePage.agency = 'LEEDS (HMP)'
        to EnRoutePage

        then:
        at EnRoutePage

        getCells(tableRows) == [
                ['', 'Lastname1, Firstname1','A1234AA','10/10/2019', '12:00\n10/10/2019', 'Low Newton (HMP)','Normal transfer', 'ACCT OPENE‑LISTCAT A'],
                ['', 'Lastname2, Firstname2', 'G0000AA', '10/10/1980', '13:00\n10/10/2018', 'Leeds (HMP)', 'Normal transfer','' ]

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
