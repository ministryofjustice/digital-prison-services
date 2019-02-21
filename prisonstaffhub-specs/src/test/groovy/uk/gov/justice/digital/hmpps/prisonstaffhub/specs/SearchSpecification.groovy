package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.module.FormElement
import geb.spock.GebReportingSpec
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class SearchSpecification extends GebReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "The search page is displayed"() {

        when: "I log in"
        elite2api.stubGroups ITAG_USER.workingCaseload
        fixture.loginAs(ITAG_USER)

        then: 'The search page is displayed'
        at SearchPage
    }

    def "Validation error if neither activity and location are selected"() {
        given: 'I am on the search page'
        fixture.toSearch()

        when: "I deselect both activity and location"
        activity = '--'
        location = '--'
        continueButton.click()

        then: 'an error is displayed'
        at SearchPage
        validationMessage.text() == "Please select location or activity"
    }

    def "The activity location list is updated when selecting date or period"() {
        given: 'I am on the search page'
        fixture.toSearch()
        at SearchPage

        when: "I select a date"
        def currentPeriod = period.value()
        elite2api.stubActivityLocations('2018-07-23', currentPeriod)
        setDatePicker('2018', 'Jul', '23')
        waitFor { !activity.module(FormElement).disabled }

        then: 'a new activity location list is displayed'
        activity.find('option', value: '4').text() == 'loc4'

        when: "I select a period"
        // First use a different date to reset to original activity list
        setDatePicker('2018', 'Aug', '10')
        waitFor { !activity.module(FormElement).disabled }
        activity.find('option', value: '1').text() == 'loc1'

        def newPeriod = currentPeriod == 'ED' ? 'PM' : 'ED'
        // Now add stub for other list
        elite2api.stubActivityLocations('2018-08-10', newPeriod)
        form['period-select'] = newPeriod
        waitFor { !activity.module(FormElement).disabled }

        then: 'a new activity location list is displayed'
        activity.find('option', value: '4').text() == 'loc4'
    }

    def "Then the caseload is changed the search page is updated with the new locations"() {

        given: 'I am on the search page'
        fixture.toSearch()
        at SearchPage

        when: 'The active caseload is changed'
        elite2api.stubHealth()
        elite2api.stubUpdateActiveCaseload()
        elite2api.stubGroups Caseload.SYI
        oauthApi.stubGetMyDetails(ITAG_USER, Caseload.SYI.id)
        oauthApi.stubGetMyRoles()
        elite2api.stubGetMyCaseloads ITAG_USER.caseloads
        elite2api.stubActivityLocations()
        header.switchCaseload(Caseload.SYI.id);

        then: 'the locations LOV is updated'
        waitFor { $("div", text: contains("SHREWSBURY (HMP)")) }
        location.find('option', value: 'block1').text() == 'block1'
    }
}
