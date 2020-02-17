package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.module.FormElement
import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.SearchPage
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.VideoLinkPage

import java.time.LocalDate

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER

class SearchSpecification extends BrowserReportingSpec {

    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi, whereaboutsApi)

    def "The search page is displayed"() {

        when: "I log in"
        whereaboutsApi.stubGroups ITAG_USER.workingCaseload
        fixture.loginAs(ITAG_USER)

        then: 'The search page is displayed'
        at SearchPage
    }

    def "Video court user is redirected to video link home page"() {

        when: "I log in"
        whereaboutsApi.stubGroups ITAG_USER.workingCaseload
        fixture.loginAsVideoLinkCourtUser(ITAG_USER)

        and: "Navigate to the root url"
        go "/"

        then: 'The video link home page is displayed'
        at VideoLinkPage
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
        validationMessage.find('li').text() == "Please select location or activity"
    }

    def "The activity location list is updated when selecting date or period"() {
        def lastYear = (LocalDate.now().year-1).toString()
        given: 'I am on the search page'
        fixture.toSearch()
        at SearchPage

        when: "I select a date"
        def currentPeriod = period.value()
        elite2api.stubActivityLocations("${lastYear}-07-23", currentPeriod)
        setDatePicker('2019', 'Jul', '23')
        waitFor { !activity.module(FormElement).disabled }

        then: 'a new activity location list is displayed'
        activity.find('option', value: '4').text() == 'loc4'

        when: "I select a period"
        // First use a different date to reset to original activity list
        setDatePicker(lastYear, 'Aug', '10')
        waitFor { !activity.module(FormElement).disabled }
        activity.find('option', value: '1').text() == 'loc1'

        def newPeriod = currentPeriod == 'ED' ? 'PM' : 'ED'
        // Now add stub for other list
        elite2api.stubActivityLocations("${lastYear}-08-10", newPeriod)
        form['period-select'] = newPeriod
        waitFor { !activity.module(FormElement).disabled }

        then: 'a new activity location list is displayed'
        activity.find('option', value: '4').text() == 'loc4'
    }
}
