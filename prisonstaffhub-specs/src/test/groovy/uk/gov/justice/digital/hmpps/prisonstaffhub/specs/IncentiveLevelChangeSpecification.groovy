package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.IncentiveLevelChangePage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class IncentiveLevelChangeSpecification extends BrowserReportingSpec {
    
    static final NOTM_URL = 'http://localhost:20200/'
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "should present the Incentive Level change form page when role MAINTAIN_IEP"() {
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

        def iepLevels = [
                [
                    iepLevel: "BAS",
                    iepDescription: "Basic"
                ],
                [
                    iepLevel: "STD",
                    iepDescription: "Standard"
                ],
                [
                    iepLevel: "ENH",
                    iepDescription: "Enhanced"
                ],
                [
                    iepLevel: "ENT",
                    iepDescription: "Entry"
                ],
        ]

        elite2api.stubOffenderDetails('A1234AC', offenderDetails)
        elite2api.stubAgencyDetails('LEI', agencyDetails)
        elite2api.stubUserDetails('ITAG_USER', userDetails)
        elite2api.stubGetIepSummaryWithDetails('-3')
        elite2api.stubGetAgencyIepLevels('LEI', iepLevels)

        given: "I am logged in"
        fixture.loginAsMaintainIep(ITAG_USER)

        when: "I view the Incentive Level change page"
        to IncentiveLevelChangePage

        then: "I should be presented with the form"

        breadcrumb == [['Home', NOTM_URL],
                       ['Bates, Norman', "http://localhost:3006/prisoner/A1234AC"],
                       ['Incentive details', 'http://localhost:3006/offenders/A1234AC/incentive-level-details'],
                       ['Change incentive level', '']]

        pageTitle == "Change incentive level"
        formLabel == "Select new level"

        waitFor { basicInput }
        waitFor { standardInput }
        waitFor { reasonInput }

    }
}
