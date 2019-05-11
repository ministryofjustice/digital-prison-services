package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.IepHistory

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER
import static uk.gov.justice.digital.hmpps.prisonstaffhub.specs.AgencySelectionSpecification.getNOTM_URL

class IepHistorySpecification extends BrowserReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should present iep history"() {
        def offenderDetails = [
                bookingId: -3,
                bookingNo: "A00113",
                offenderNo: "A1234AC",
                firstName: "NORMAN",
                middleName: "JOHN",
                lastName: "BATES",
                agencyId: "LEI",
                assignedLivingUnitId: -3,
                activeFlag: true,
                dateOfBirth: "1999-10-27"
        ]

        def agencyDetails = [
                agencyId: "LEI",
                description: "Leeds",
                agencyType: "INST"
        ]
        def userDetails = [
                username: "ITAG_USER",
                firstName: "Staff",
                lastName: "Member"
        ]

        elite2api.stubOffenderDetails('A1234AC', offenderDetails)
        elite2api.stubAgencyDetails('LEI', agencyDetails)
        elite2api.stubUserDetails('ITAG_USER', userDetails)
        elite2api.stubGetIepSummaryWithDetails('-3')

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I view the IEP history page"
        to IepHistory

        then: "I should be presented with results"

        breadcrumb == [['Home', NOTM_URL],
                       ['Bates, Norman', "${NOTM_URL}offenders/A1234AC/quick-look"],
                       ['Iep-history', '']]

        tableRows.size() == 4 // Including header row
        def columns1 = tableRows[1].find('td')
        columns1*.text() == ['12/10/2017 - 09:44','Basic',
                             'Assaulted another inmate.',
                             'Leeds',
                             'Staff Member',]
        def columns2 = tableRows[2].find('td')
        columns2*.text() == ['22/08/2017 - 18:42','Standard',
                             'He has been a very good boy.',
                             'Leeds',
                             'Staff Member',]
        def columns3 = tableRows[3].find('td')
        columns3*.text() == ['04/07/2017 - 12:15','Entry',
                             'Just came in.',
                             'Leeds',
                             'Staff Member',]

        labels.size() == 3
        labels*.text() == ['Current IEP level',
                          'Days since review',
                          'Date of next review']

        currentIepLevelData.size() == 3
        currentIepLevelData*.text() == ['Enhanced',
                                        '572',
                                        '12/10/2018']
    }
}
