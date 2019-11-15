package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.IepChangePage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.IepDetails

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class IepChangeSpecification extends BrowserReportingSpec {
    
    static final NOTM_URL = 'http://localhost:20200/'
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should present the IEP change form page when role MAINTAIN_IEP"() {
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

        when: "I view the IEP change page"
        to IepChangePage

        then: "I should be presented with the form"

        breadcrumb == [['Home', NOTM_URL],
                       ['Bates, Norman', "${NOTM_URL}offenders/A1234AC/quick-look"],
                       ['IEP details', 'http://localhost:3006/offenders/A1234AC/iep-details'],
                       ['Change IEP', '']]

        pageTitle == "Change IEP level"
        formLabel == "Select new level"

        waitFor { basicInput }
        waitFor { standardInput }
        waitFor { reasonInput }

    }
}
