package uk.gov.justice.digital.hmpps.prisonstaffhub.model

import geb.Browser
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.AccessRoles
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.DashboardPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.LoginPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class TestFixture {

    Browser browser
    Elite2Api elite2Api
    OauthApi oauthApi

    UserAccount currentUser

    TestFixture(Browser browser, Elite2Api elite2Api, OauthApi oauthApi) {
        this.browser = browser
        this.elite2Api = elite2Api
        this.oauthApi = oauthApi
    }

    def loginAs(UserAccount user) {
        currentUser = user
        stubForLogin(currentUser)

        browser.to SearchPage
    }

    def loginAsMaintainIep(UserAccount user) {
        currentUser = user
        stubForLogin(currentUser, [AccessRoles.maintain_iep])

        browser.to SearchPage
    }

    private void stubForLogin(UserAccount currentUser, def roles = ['ROLE']) {
        oauthApi.stubValidOAuthTokenLogin()

        oauthApi.stubGetMyDetails currentUser
        oauthApi.stubGetMyRoles(roles)
        elite2Api.stubGetMyCaseloads currentUser.caseloads
        elite2Api.stubGroups currentUser.workingCaseload
        elite2Api.stubActivityLocations()
    }

    def toSearch() {
        loginAs ITAG_USER
    }

    def clickWhereaboutsLink() {
        browser.at DashboardPage
        browser.page.whereaboutsLink.click()
    }


    static List<Location> locationsForCaseload(Caseload caseload) {
        def agencyLocations = caseload.locations

        List<Location> locations = agencyLocations.collect { Location.toLocation it }
        locations.addAll(agencyLocations.collectMany { agencyLocation ->
            AgencyInternalLocation
                    .childrenOf(agencyLocation)
                    .findAll { it.type == 'WING' }
                    .collect { Location.toLocation it }
        })
        locations
    }
}
