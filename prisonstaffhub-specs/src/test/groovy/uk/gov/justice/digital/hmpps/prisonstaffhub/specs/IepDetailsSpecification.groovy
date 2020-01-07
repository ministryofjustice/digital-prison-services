package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.IepDetails

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class IepDetailsSpecification extends BrowserReportingSpec {

    static final NOTM_URL = 'http://localhost:20200/'

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should present Incentive level history, no change Incentive level button without role"() {
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

        when: "I view the Incentive level history page"
        to IepDetails

        then: "I should be presented with results"

        breadcrumb == [['Home', NOTM_URL],
                       ['Bates, Norman', "${NOTM_URL}offenders/A1234AC/quick-look"],
                       ['Incentive details', '']]

        tableRows.size() == 5 // Including header row

        def columns1 = tableRows[1].find('td')
        columns1*.text() == ['12/10/2017 - 07:53','Enhanced',
                             'Did not assault another inmate - data entry error.',
                             'Leeds',
                             'Staff Member',]
        def columns2 = tableRows[2].find('td')
        columns2*.text() == ['12/10/2017 - 09:44','Basic',
                             'Assaulted another inmate.',
                             'Leeds',
                             'Staff Member',]
        def columns3 = tableRows[3].find('td')
        columns3*.text() == ['22/08/2017 - 18:42','Standard',
                             'He has been a very good boy.',
                             'Leeds',
                             'Staff Member',]
        def columns4 = tableRows[4].find('td')
        columns4*.text() == ['04/07/2017 - 12:15','Entry',
                             'Just came in.',
                             'Leeds',
                             'Staff Member',]

        labels.size() == 3
        labels*.text() == ['Current Incentive level',
                          'Time since review',
                          'Date of next review']

        currentIepLevelData.size() == 3
        currentIepLevelData*.text() == ['Enhanced',
                                        '1 year, 207 days',
                                        '12/10/2018']


        assert(!($('button[data-qa="change-iep"]').isDisplayed()))
    }

    def "should present Incentive level history with change Incentive level button"() {
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
        fixture.loginAsMaintainIep(ITAG_USER)

        when: "I view the Incentive level history page as a use with the MAINTAIN_IEP role"
        to IepDetails

        then: "I should see the Change Incentive level button"

        assert(($('button[data-qa="change-iep"]').isDisplayed()))
    }
}
