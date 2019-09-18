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
                [
                        convictionId: 1,
                        index: "1",
                        active: true,
                        Breach: false,
                        convictionDate: "2019-09-03",
                        referralDate: "2018-09-04",
                        offences: [
                                [
                                        offenceId: "M2500295343",
                                        mainOffence: true,
                                        detail: [
                                                code: "00102",
                                                description: "Murder (incl abroad) of infants under 1 year of age - 00102",
                                                mainCategoryCode: "001",
                                                mainCategoryDescription: "Murder",
                                                mainCategoryAbbreviation: "Murder",
                                                ogrsOffenceCategory: "Violence",
                                                subCategoryCode: "02",
                                                subCategoryDescription: "Murder of infants under 1 year of age",
                                                form20Code: "20"
                                        ],
                                        offenceDate: "2018-08-04T00:00:00",
                                        offenceCount: 1,
                                        offenderId: 1,
                                        createdDatetime: "2019-09-04T12:13:48",
                                        lastUpdatedDatetime: "2019-09-04T12:13:48"
                                ]
                        ],
                        sentence: [
                            description: "CJA - Indeterminate Public Prot.",
                            originalLength: 5,
                            originalLengthUnits: "Years",
                            secondLength: 5,
                            secondLengthUnits: "Years",
                            defaultLength: 60,
                            lengthInDays: 1826
                        ],
                        latestCourtAppearanceOutcome: [
                            code: "303",
                            description: "CJA - Indeterminate Public Prot."
                        ],
                        custody: [
                            bookingNumber: "V74111",
                            institution: [
                                institutionId: 2500004521,
                                isEstablishment: true,
                                code: "BWIHMP",
                                description: "Berwyn (HMP)",
                                institutionName: "Berwyn (HMP)"
                            ]
                        ]                        
                ],
                [
                        convictionId: 2,
                        index: "2",
                        active: false,
                        Breach: false,
                        convictionDate: "2018-09-03",
                        referralDate: "2017-09-04",
                        offences: [
                                [
                                        offenceId: "M2500295343",
                                        mainOffence: true,
                                        detail: [
                                                code: "05600",
                                                description: "Arson - 05600",
                                                mainCategoryCode: "056",
                                                mainCategoryDescription: "Arson",
                                                mainCategoryAbbreviation: "Arson",
                                                ogrsOffenceCategory: "Criminal damage",
                                                subCategoryCode: "00",
                                                subCategoryDescription: "Arson",
                                                form20Code: "58"
                                        ],
                                        offenceDate: "2017-08-04T00:00:00",
                                        offenceCount: 2,
                                        offenderId: 1,
                                        createdDatetime: "2018-09-04T12:13:48",
                                        lastUpdatedDatetime: "2018-09-04T12:13:48"
                                ]
                        ],
                        sentence: [
                                description: "CJA - Community Order.",
                                originalLength: 12,
                                originalLengthUnits: "Months",
                                defaultLength: 12,
                                lengthInDays: 364
                        ],
                        latestCourtAppearanceOutcome: [
                                code: "201",
                                description: "CJA - Community Order."
                        ]
                ]

        ]

        def documents = [
                documents: [[
                        id: "1e593ff6-d5d6-4048-a671-cdeb8f65608b",
                        documentName: "PRE-CONS.pdf",
                        author: "Sandra Becker",
                        type: [
                            code: "PRECONS_DOCUMENT",
                            description: "PNC previous convictions"
                        ],
                        extendedDescription: "Previous convictions as of 01/09/2019",
                        createdAt: "2019-09-10T00:00:00"                ]],
                convictions: [
                        [
                                convictionId: "1",
                                documents: [[
                                        id: "cc8bf04c-2f8c-4e72-a14b-ab6a5702bf59",
                                        documentName: "CPSPack1.txt",
                                        author: "Millie Milk",
                                        type: [
                                                code: "CPSPACK_DOCUMENT",
                                                description: "Crown Prosecution Service case pack"
                                        ],
                                        extendedDescription: "Crown Prosecution Service case pack for 01/06/2017",
                                        createdAt: "2019-09-04T00:00:00"
                                ]]
                        ],
                        [
                                convictionId: "2",
                                documents: [[
                                        id: "04897043-6b84-45b8-b278-4fffea477ef3",
                                        documentName: "CPSPack2.txt",
                                        author: "Barnie Books",
                                        type: [
                                                code: "CPSPACK_DOCUMENT",
                                                description: "Crown Prosecution Service case pack"
                                        ],
                                        extendedDescription: "Crown Prosecution Service case pack for 05/05/2017",
                                        createdAt: "2019-09-05T00:00:00"
                                ]]
                        ]
                ]
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
        communityApi.stubDocuments('A1234AC', documents)

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)
        oauthApi.stubGetMyRoles([
                [roleCode: 'VIEW_PROBATION_DOCUMENTS']
        ])

        when: "I view the probation documents page"
        to ProbationDocumentsPage
        and: "click all the conviction accordions"
        accordionButtons*.click()

        then: "I should be presented with the probation documents page"
        breadcrumb == [['Home', NOTM_URL],
                       ['Bates, Norman', "${NOTM_URL}offenders/A1234AC"],
                       ['Probation documents', null]]

        and: "shown a break down of convictions"
        convictionTitles == [
                'CJA - Indeterminate Public Prot. (5 Years) at Berwyn (HMP)',
                'CJA - Community Order. (12 Months)'
        ]

        and: "a list of documents"
        documentTitles == [
                'PRE-CONS.pdf',
                'CPSPack1.txt',
                'CPSPack2.txt']
    }
}
