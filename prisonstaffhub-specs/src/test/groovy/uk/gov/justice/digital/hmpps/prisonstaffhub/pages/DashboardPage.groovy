package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.ErrorsModule
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class DashboardPage extends Page {

    static url = "/"

    static at = {
        headingText == 'Prison staff hub'
        whereaboutsLink.displayed
    }

    static content = {
        headingText { $('h1').first().text() }
        header(required: false) { module(HeaderModule) }
        whereaboutsLink(to: SearchPage) { $('#whereabouts_link') }
    }
}
