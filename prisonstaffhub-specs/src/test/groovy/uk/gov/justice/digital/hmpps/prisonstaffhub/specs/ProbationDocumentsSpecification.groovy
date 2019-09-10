package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.CommunityApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.ProbationDocumentsPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER
import static uk.gov.justice.digital.hmpps.prisonstaffhub.specs.AgencySelectionSpecification.NOTM_URL

class ProbationDocumentsSpecification extends BrowserReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    CommunityApi communityApi = new CommunityApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should present probation document page"() {
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

        def userDetails = [
                username: "ITAG_USER",
                firstName: "Staff",
                lastName: "Member"
        ]

        def convictions = [

        ]

        def probationOffenderDetails = [
                firstName: "Norman",
                surname: "Bates",
                otherIds: [
                        crn: "X123456"
                ]

        ]
        elite2api.stubOffenderDetails('A1234AC', offenderDetails)
        elite2api.stubUserDetails('ITAG_USER', userDetails)
        oauthApi.stubSystemUserTokenRequest()
        communityApi.stubConvictions('A1234AC', convictions)
        communityApi.stubOffenderDetails('A1234AC', probationOffenderDetails)

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)
        oauthApi.stubGetMyRoles([
                [roleCode: 'VIEW_PROBATION_DOCUMENTS']
        ])

        when: "I view the probation documents page"
        to ProbationDocumentsPage

        then: "I should be presented probation documents"

        breadcrumb == [['Home', NOTM_URL],
                       ['Bates, Norman', "${NOTM_URL}offenders/A1234AC"],
                       ['Probation documents', null]]
    }
}
